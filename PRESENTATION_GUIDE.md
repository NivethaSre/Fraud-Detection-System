# 🎓 Project Presentation Guide

Use this sequence to present the project logically, moving from the "Why" to the "How," and finally the "Showcase."

---

## 1. Introduction (The Problem)
*   **Hook**: E-commerce return fraud costs billions annually.
*   **Problem**: Traditional systems look at *rules* (e.g., "Return < 30 days"). They miss context.
*   **Gap**: They can't "see" fake images or "understand" suspicious text patterns effectively.
*   **Solution**: We built a **Multi-Modal AI System** that sees, reads, and reasons like a human investigator.

## 2. System Architecture (The Logic)
Briefly explain how data flows through the system.

1.  **Input**: User submits text + image.
2.  **Processing (Parallel)**:
    *   **Text Engine**: BERT Model converts text to vectors -> Queries Qdrant Database for similar past fraud.
    *   **Vision Engine**: ViT Models analyze the image to detect if it's a downloaded or AI-generated fake (Deepfake detection).
3.  **Synthesis**: The rules engine combines these scores.
4.  **GenAI Layer**: Groq (Llama-4) takes all this raw data and writes a summary.
5.  **Output**: JSON response to the React Frontend.

## 3. Key Components (The Code)
Highlight these files during your code walkthrough:

*   **`api.py` (The Brain)**:
    *   Show the `/analyze-claim` endpoint.
    *   Explain how it orchestrates Text + Image + Keywords.
    *   Show the `generate_ai_report` function calling Groq.

*   **`image_detect.py` (The Eyes)**:
    *   Show the `analyze()` method.
    *   Mention the use of HuggingFace Transformers (ViT) to detect "AI vs Real".

*   **`IntegratedAnalysis.jsx` (The Face)**:
    *   Show how `FormData` handles file uploads.
    *   Show the UI logic for displaying the "AI Investigation Summary."

## 4. Live Demo (The "Wow" Factor)
Follow this script for a smooth demo:

**Scenario A: Safe Claim**
1.  **Text**: "The shirt didn't fit, it was too small."
2.  **Image**: (Upload a normal photo or leave blank).
3.  **Result**: Low Risk.
4.  **Point out**: "See? The system recognizes normal customer behavior."

**Scenario B: The Fraud Attempt**
1.  **Text**: "The product was completely broken and fake, give me refund immediately." (Aggressive keyword usage).
2.  **Image**: (Upload an AI-generated image or a generic internet photo).
3.  **Result**: High Risk!
4.  **Point out**:
    *   **Text Risk**: High (due to keywords/similarity).
    *   **Image Verdict**: "Likely AI Generated".
    *   **AI Summary**: Read the Llama-4 explanation out loud. "The AI successfully identified conflicting evidence..."

## 5. Future Scope
*   Real-time transaction graph integration.
*   Biometric authentication.
*   Mobile App integration.

---
**Tip**: Keep the terminal window open to show the backend logs (`uvicorn`) updating in real-time as you click "Analyze". It proves the system is live!
