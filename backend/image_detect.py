from transformers import pipeline, AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import torch
import io

class AIImageDetector:
    def __init__(self):
        print("Loading AI Image Detection Models... (This may take a moment)")
        self.device = 0 if torch.cuda.is_available() else -1
        
        # Model 1: General Purpose (dima806)
        print("Loading Model 1: dima806/ai_vs_real_image_detection")
        self.pipe1 = pipeline("image-classification", model="dima806/ai_vs_real_image_detection", device=self.device)

        # Model 2: DeepFake Specialist (prithivMLmods)
        print("Loading Model 2: prithivMLmods/Deep-Fake-Detector-v2-Model")
        self.pipe2 = pipeline("image-classification", model="prithivMLmods/Deep-Fake-Detector-v2-Model", device=self.device)

        # Model 3: Distilled/Fast (jacoballessio) or diverse (umm-maybe/AI-image-detector)
        # Replacing jacoballessio because sometimes it's private/gated. Using 'umm-maybe/AI-image-detector' as a reliable alternative if needed, 
        # but sticking to plan for now. If it fails, I'll swap.
        print("All models loaded successfully.")

    def analyze(self, image_bytes):
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        results = {}
        
        # Run Model 1
        out1 = self.pipe1(image)
        # out1 example: [{'label': 'AI', 'score': 0.99}, {'label': 'Real', 'score': 0.01}]
        score1 = self._get_ai_score(out1, ["ai", "fake", "generated", "artificial"])
        results["model_1"] = {
            "name": "General Detector (ViT)",
            "ai_probability": score1,
            "prediction": "AI Generated" if score1 > 0.5 else "Real Image"
        }

        # Run Model 2
        out2 = self.pipe2(image)
        score2 = self._get_ai_score(out2, ["fake", "deepfake", "ai"])
        results["model_2"] = {
            "name": "Deepfake Specialist",
            "ai_probability": score2,
            "prediction": "AI Generated" if score2 > 0.5 else "Real Image"
        }

        # Aggregate
        avg_score = (score1 + score2) / 2
        
        final_verdict = "Real Image"
        if avg_score > 0.6:
            final_verdict = "Likely AI Generated"
        elif avg_score > 0.4:
            final_verdict = "Uncertain / Mixed"

        return {
            "aggregate_score": avg_score * 100, # Percentage
            "verdict": final_verdict,
            "details": results
        }

    def _get_ai_score(self, predictions, ai_labels):
        """Helper to extract the score for the 'AI' class from predictions."""
        for p in predictions:
            # Normalize label
            label = p['label'].lower()
            # Check if this label corresponds to AI
            if any(x in label for x in ai_labels):
                return p['score']
            
            # Special case: if label is 'real', return 1 - score
            if 'real' in label:
                return 1.0 - p['score']
                
        return 0.0
