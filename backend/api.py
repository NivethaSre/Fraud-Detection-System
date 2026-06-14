from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
from qdrant_client import QdrantClient
from qdrant_client.http.models import PointStruct
import numpy as np
import json
from transformers import BertTokenizer, BertModel
import torch
from datetime import datetime
from uuid import uuid4
import os
import requests
from fastapi.middleware.cors import CORSMiddleware
from image_detect import AIImageDetector
from qdrant_client.http import models as rest

# Initialize FastAPI
app = FastAPI(title="Fraud Detection API")

# Initialize Image Detector (Global)
print("Initializing AI Image Detector...")
image_detector = AIImageDetector()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Global Model & Client Setup
# ---------------------------------------------------------
print("Loading BERT model...")
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')
model.eval()

STORAGE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "qdrant_storage"))
COLLECTION_NAME = "fraud_descriptions"
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL_NAME = "meta-llama/llama-4-scout-17b-16e-instruct"

client = QdrantClient(path=STORAGE_PATH)

def generate_embedding(text: str):
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True, max_length=128)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()

def generate_ai_report(text_risk, image_verdict, behavioral_flags, description):
    prompt = f"""
    You are a Senior Fraud Investigator at an E-Commerce company. Write a short, professional investigation summary for this return claim.
    
    Claim Details:
    - Customer Description: "{description}"
    - Automated Text Analysis: {text_risk} Risk
    - Image Forensics: {image_verdict}
    - Customer Behavior: {behavioral_flags}
    
    Format the output as a clean, direct expert opinion. Explain WHY the risk is high or low based on the signals.
    Start with "INVESTIGATION SUMMARY:" and keep it under 100 words.
    """
    
    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.5,
        "max_tokens": 150
    }
    
    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        response = requests.post(GROQ_URL, json=payload, headers=headers)
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        else:
            print(f"Groq API Error: {response.status_code} - {response.text}")
            return f"AI Analysis Unavailable: API Error ({response.status_code})"
    except Exception as e:
        print(f"Groq API Exception: {e}")
        return "AI Analysis Unavailable"

# ---------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------
class DetectionRequest(BaseModel):
    description: str

class MatchItem(BaseModel):
    text: str
    type: str
    score: float
    core: bool

class BehavioralRisk(BaseModel):
    total_claims: int
    fraud_history_score: float
    return_frequency_score: float
    risk_level: str

class MultiModalResponse(BaseModel):
    text_analysis: dict
    image_analysis: dict
    behavioral_analysis: BehavioralRisk
    ai_explanation: str
    final_risk_score: float
    final_verdict: str
    stored_id: str

class DetectionResponse(BaseModel):
    fraud_probability: float
    risk_level: str
    top_matches: List[MatchItem]
    stored_id: str

# ---------------------------------------------------------
# Endpoints
# ---------------------------------------------------------

@app.post("/detect", response_model=DetectionResponse)
async def detect_fraud(request: DetectionRequest):
    # Legacy endpoint, keeping for compatibility
    description = request.description.strip()
    if not description:
        raise HTTPException(status_code=400, detail="Description cannot be empty")
    
    emb = generate_embedding(description)
    search_result = client.query_points(
        collection_name=COLLECTION_NAME,
        query=emb.tolist(),
        limit=5,
        with_payload=True
    )
    matches = search_result.points if hasattr(search_result, 'points') else search_result
    
    threshold = 0.75
    if not matches:
        fraud_prob = 0.0
        risk = "No matches found"
        match_items = []
    else:
        scores = [m.score for m in matches]
        avg_score = np.mean(scores)
        fraud_prob = float(avg_score * 100)
        risk = "High Risk - Likely Fraud" if avg_score > threshold else "Low Risk - Likely Genuine"
        
        match_items = []
        for m in matches:
            match_items.append(MatchItem(
                text=m.payload.get('text', '')[:100],
                type=m.payload.get('type', 'unknown'),
                score=float(m.score),
                core=bool(m.payload.get('core', False))
            ))

    # Store result (simplified)
    new_id = str(uuid4())
    try:
        new_point = PointStruct(
            id=new_id,
            vector=emb.tolist(),
            payload={
                "text": description,
                "type": "unknown",
                "risk_at_test": risk,
                "timestamp": datetime.now().isoformat()
            }
        )
        client.upsert(collection_name=COLLECTION_NAME, points=[new_point])
    except:
        pass

    return DetectionResponse(
        fraud_probability=fraud_prob,
        risk_level=risk,
        top_matches=match_items,
        stored_id=new_id
    )

@app.post("/analyze-claim", response_model=MultiModalResponse)
async def analyze_claim(
    description: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    # 1. Text Analysis (BERT)
    emb = generate_embedding(description)
    search_result = client.query_points(
        collection_name=COLLECTION_NAME,
        query=emb.tolist(),
        limit=5,
        with_payload=True
    )
    
    matches = search_result.points if hasattr(search_result, 'points') else search_result
    
    fraud_score_text = 0.0
    match_items = []
    
    if matches:
        weighted_sum = 0
        total_weight = 0
        
        for m in matches:
            sim = m.score
            payload = m.payload
            
            item = {
                "text": payload.get("description", "")[:100] + "...",
                "type": payload.get("type", "unknown"),
                "score": sim,
                "core": sim > 0.85
            }
            match_items.append(item)
            
            if payload.get("type") == "fraud":
                weighted_sum += sim
            elif payload.get("type") == "genuine":
                weighted_sum -= (sim * 0.5)
            else:
                # "unknown" type (legacy data) -> Treat as potential fraud but with slightly less weight than confirmed fraud
                weighted_sum += (sim * 0.8)
            
            total_weight += sim

        if total_weight > 0:
            fraud_score_text = max(0, min(1, weighted_sum / total_weight))
            if matches[0].payload.get("type") == "fraud" and matches[0].score > 0.8:
                fraud_score_text = max(fraud_score_text, 0.8)
    
    # Fallback / Heuristic: If vector search fails or returns low, check keywords
    suspicious_keywords = ["fake", "copy", "replica", "damaged", "broken", "refurd", "counterfeit", "defective", "scratched"]
    keyword_hits = sum(1 for word in suspicious_keywords if word in description.lower())
    
    if keyword_hits > 0:
        # Boost score based on keywords, ensuring it's at least 0.3 if keywords are present
        fraud_score_text = max(fraud_score_text, min(0.8, 0.2 + (keyword_hits * 0.1)))
    
    text_risk = "Low"
    if fraud_score_text > 0.7: text_risk = "High"
    elif fraud_score_text > 0.4: text_risk = "Medium"

    # 2. Image Analysis (ViT)
    image_result = {"verdict": "No Image", "confidence": 0.0, "manipulation_flags": []}
    fraud_score_image = 0.0
    
    if image:
        try:
            # 1. Read Bytes
            image_bytes = await image.read()
            
            # 2. Analyze
            image_result = image_detector.analyze(image_bytes)
            
            if "Likely AI" in image_result["verdict"]:
                fraud_score_image = 0.9
            elif "Uncertain" in image_result["verdict"]:
                fraud_score_image = 0.5
            else:
                fraud_score_image = 0.1
                
        except Exception as e:
            print(f"CRITICAL IMAGE PROCESSING ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            image_result["error"] = f"Image processing failed: {str(e)}"
            image_result["verdict"] = "Error"

    # 3. Behavioral & Temporal Analysis (Simulated based on description content or random for now since ID is removed)
    # Without customer ID, we can't look up history. We'll simulate a "neutral" or "slightly suspicious" profile 
    # if the claim itself looks risky, effectively coupling behavior to the current claim's quality.
    
    behavioral_score = 0.1
    return_freq_score = 0.1
    total_claims = 1
    
    # Heuristic: Short descriptions might suggest low effort/bot
    if len(description) < 10:
        behavioral_score = 0.4
    
    if fraud_score_text > 0.5:
         behavioral_score = 0.6 # Suspicious claim implies suspicious behavior model fallback

    behavioral_risk_level = "Low"
    if behavioral_score > 0.7: behavioral_risk_level = "High"
    elif behavioral_score > 0.4: behavioral_risk_level = "Medium"

    # 4. Final Fusion
    final_score = (
        (fraud_score_text * 0.4) + 
        (fraud_score_image * 0.3) + 
        (behavioral_score * 0.2) + 
        (return_freq_score * 0.1)
    )
    
    if "High" in text_risk and fraud_score_image > 0.8:
        final_score = max(final_score, 0.95)

    final_verdict = "Genuine"
    if final_score > 0.75: final_verdict = "High Risk Fraud"
    elif final_score > 0.45: final_verdict = "Moderate Risk"

    # 5. Generate AI Explanation (Groq)
    behavioral_flags = f"Risk Level: {behavioral_risk_level} (History Score: {int(behavioral_score*100)}, Return Freq: {int(return_freq_score*100)})"
    ai_explanation = generate_ai_report(text_risk, image_result.get("verdict", "N/A"), behavioral_flags, description)

    # 6. Store Result
    new_id = str(uuid4())
    try:
        point = PointStruct(
            id=new_id,
            vector=emb.tolist(),
            payload={
                "description": description,
                "type": "fraud" if final_score > 0.6 else "genuine",
                "risk_score": final_score,
                "risk_level": final_verdict,
                "has_image": bool(image),
                "image_verdict": image_result.get("verdict", "N/A") if image_result else "N/A",
                "ai_explanation": ai_explanation,
                "timestamp": datetime.now().isoformat()
            }
        )
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=[point]
        )
    except Exception as e:
        print(f"Error storing point: {e}")

    return {
        "text_analysis": {
            "risk_score": round(fraud_score_text, 2),
            "risk_level": text_risk,
            "top_matches": match_items
        },
        "image_analysis": image_result,
        "behavioral_analysis": {
            "total_claims": total_claims,
            "fraud_history_score": round(behavioral_score * 100, 1),
            "return_frequency_score": round(return_freq_score * 100, 1),
            "risk_level": behavioral_risk_level
        },
        "ai_explanation": ai_explanation,
        "final_risk_score": round(final_score * 100, 1),
        "final_verdict": final_verdict,
        "stored_id": new_id
    }

@app.post("/detect-image")
async def detect_ai_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        image_bytes = await file.read()
        results = image_detector.analyze(image_bytes)
        return results
    except Exception as e:
        print(f"Image detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats():
    try:
        total_scans = client.count(collection_name=COLLECTION_NAME).count
        
        # Fraud Filter
        fraud_filter = rest.Filter(
            should=[
                rest.FieldCondition(key="risk_at_test", match=rest.MatchValue(value="High Risk - Likely Fraud")),
                rest.FieldCondition(key="risk_level", match=rest.MatchValue(value="High Risk Fraud"))
            ]
        )
        fraud_count = client.count(collection_name=COLLECTION_NAME, count_filter=fraud_filter).count
        
        # AI Image Filter
        ai_filter = rest.Filter(
            should=[
                rest.FieldCondition(key="image_verdict", match=rest.MatchValue(value="Likely AI Generated")),
                rest.FieldCondition(key="image_verdict", match=rest.MatchValue(value="AI Generated")),
                rest.FieldCondition(key="image_verdict", match=rest.MatchValue(value="Deepfake Confirmed"))
            ]
        )
        ai_count = client.count(collection_name=COLLECTION_NAME, count_filter=ai_filter).count
        
        return {
            "total_scans": total_scans,
            "fraud_detected": fraud_count,
            "ai_images_detected": ai_count
        }
    except Exception as e:
        print(f"Stats Error: {e}")
        return {"total_scans": 0, "fraud_detected": 0, "ai_images_detected": 0}

@app.get("/history")
async def get_history():
    try:
        records, _ = client.scroll(
            collection_name=COLLECTION_NAME,
            limit=10,
            with_payload=True,
            with_vectors=False
        )
        
        history = []
        for r in records:
            # Handle both old and new schema
            text = r.payload.get("text") or r.payload.get("description", "")
            risk = r.payload.get("risk_level") or r.payload.get("risk_at_test", "Unknown")
            date = r.payload.get("timestamp") or r.payload.get("tested_at", "Unknown")
            
            history.append({
                "id": r.id,
                "text": text[:50] + "...",
                "risk": risk,
                "date": date,
                "has_image": r.payload.get("has_image", False),
                "image_verdict": r.payload.get("image_verdict", "N/A")
            })
        
        return history
    except Exception as e:
        print(f"History Error: {e}")
        return []

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Fraud Detection API is running"}
