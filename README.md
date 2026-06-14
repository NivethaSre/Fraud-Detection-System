# Multi-Modal E-Commerce Return Fraud Detection System

## 📌 Project Overview
This project is an advanced **AI-powered Fraud Detection System** designed for E-Commerce platforms. It analyzes return claims using a **Multi-Modal** approach, combining **Text Analysis** (NLP), **Image Forensics** (Computer Vision), and **Behavioral Heuristics** to determine the likelihood of fraud.

The system features a **Groq (Llama-4-Scout)** integration to generate human-readable investigation reports, explaining the "WHY" behind every fraud decision.

## 🚀 Key Features
*   **Multi-Modal Analysis**: Fuses text descriptions and image evidence for a holistic risk assessment.
*   **AI-Powered Text Analysis**: Uses **BERT** embeddings and vector search (Qdrant) to detect semantic similarities with known fraud patterns.
*   **Image Forensics**: Detects **AI-generated images** (e.g., Deepfakes) using an ensemble of Vision Transformers (ViT) to prevent "fake proof" fraud.
*   **GenAI Investigation Reports**: Integrates **Groq Llama-4** to write expert-level summary reports for each claim.
*   **Real-time Dashboard**: A modern, interactive React frontend for investigators to review claims.

## 🛠️ Tech Stack
### Backend
*   **FastAPI**: High-performance API framework.
*   **Qdrant**: Vector database for similarity search (RAG-like architecture).
*   **PyTorch & Transformers**: For BERT and ViT model execution.
*   **Groq API**: For ultra-fast LLM inference.

### Frontend
*   **React + Vite**: Fast, modern UI framework.
*   **Framer Motion**: For smooth animations and transitions.
*   **TailwindCSS**: For styling.

## 📂 Project Structure
```text
.
├── backend/               # Main Backend Python Application
│   ├── api.py             # FastAPI Entry point
│   ├── image_detect.py    # AI Image Detection Engine (ViT Ensemble)
│   ├── qdrant_storage/    # Persistent Vector Database Storage
│   └── requirements.txt   # Backend dependencies
├── frontend/              # React/Vite Frontend Application
│   ├── src/               # React source files
│   ├── package.json       # Node dependencies
│   └── vite.config.js     # Vite configuration
└── test_images/           # Sample images for testing the system
```

## ⚡ Setup & Local Development

### 1. Backend Setup
Navigate to the backend directory and run the FastAPI server:
```bash
cd backend

# Create and activate virtual environment (Windows)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run Server
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup
Navigate to the frontend directory and start the Vite development server:
```bash
cd frontend

# Install dependencies
npm install

# Run Development Server
npm run dev
```

## 🚀 Deployment Guide

### Deploying the Frontend (Vercel / Netlify)
1. Push the repository to GitHub.
2. Go to Vercel or Netlify and import the repository.
3. Set the **Root Directory** to `frontend`.
4. Framework Preset: **Vite**
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Ensure you set an environment variable `VITE_API_URL` pointing to your deployed backend URL.

### Deploying the Backend (Render / Railway / AWS)
1. Import the repository into your platform (e.g., Render Web Service).
2. Set the **Root Directory** to `backend`.
3. Select **Python** environment.
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn api:app --host 0.0.0.0 --port $PORT`
6. Make sure to add `GROQ_API_KEY` to the Environment Variables.

## 📝 Usage Guide
1. Open the Frontend Application URL.
2. Navigate to **"Integrated Analysis"**.
3. Enter a return reason (e.g., "Item arrived broken").
4. Upload a photo from the `test_images/` folder.
5. Click **"Analyze Claim"**.
6. View the **Risk Score**, **Image Authenticity**, and the **AI Investigation Summary**.
