# 💫 AuroraAI - Modern SaaS AI Platform

AuroraAI is a premium, production-ready full-stack AI application featuring a modular backend, a dedicated Python AI microservice, and a stunning React frontend.

## ✨ Features

- **Dashboard**: High-level overview of AI capabilities with glassmorphism UI.
- **Content Generator**: Create professional blogs, emails, and social posts using local LLMs.
- **Document Analyzer**: Upload PDF/Docx/TXT to extract summaries and process for Q&A.
- **Document Q&A**: Interactive chat interface powered by RAG (Retrieval Augmented Generation) and FAISS.
- **Local-First AI**: Powered by Ollama for privacy and performance.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS v4, Framer Motion, Lucide React.
- **Backend (Node.js)**: Express.js API Gateway, Multer for file processing.
- **AI Service (Python)**: FastAPI, Ollama (llama3), Sentence-Transformers, FAISS, PyPDF.

---

## 🚀 Setup Instructions

### 1. Prerequisites
- [Ollama](https://ollama.com/) (Installed and running)
- Node.js (v18+)
- Python (3.9+)

### 2. Pull Local AI Models
Open your terminal and run:
```bash
ollama pull llama3
```

### 3. Setup Python AI Microservice
```bash
cd ai-service
# It is recommended to use a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install -r requirements.txt
python main.py
```
*Service runs on: http://localhost:8000*

### 4. Setup Node.js Backend
```bash
cd backend
npm install
npm install -g nodemon # Optional for dev
node index.js
```
*Backend runs on: http://localhost:5000*

### 5. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
*App runs on: http://localhost:5173*

---

## 📂 Project Structure

```text
├── ai-service/          # Python FastAPI Microservice
│   ├── routes/          # API endpoints
│   ├── services/        # AI & Document Logic
│   └── main.py          # Entry point
├── backend/             # Node.js Express Gateway
│   ├── routes/          # API proxy routes
│   ├── controllers/     # API logic
│   └── index.js         # Entry point
├── frontend/            # React (Vite) Application
│   ├── src/components/  # UI Components (Glassmorphism)
│   ├── src/pages/       # App Sections
│   └── src/index.css    # Tailwind v4 Styles
```

## 📝 License
MIT
