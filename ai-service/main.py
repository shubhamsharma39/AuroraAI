"""
AuroraAI — FastAPI Main Entry Point (Upgraded)
Includes:
  - Structured logging system
  - Environment variable loading
  - Clean startup/shutdown lifecycle
"""

import os
import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes import ai_routes

# ── Load environment variables ────────────────────────────────────
load_dotenv()

# ── Logging setup ─────────────────────────────────────────────────
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("aurora.main")

# ── FastAPI App ───────────────────────────────────────────────────
app = FastAPI(
    title="AuroraAI Microservice",
    version="2.0.0",
    description="Upgraded AI service with Mistral/Groq LLM, BGE embeddings, Playwright scraping"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_routes.router)

@app.get("/")
async def root():
    return {
        "message": "AuroraAI Service v2.0 is running!",
        "features": {
            "llm": "Ollama (mistral) → Groq (mixtral-8x7b) → Mock",
            "embeddings": "BAAI/bge-small-en-v1.5",
            "scraping": "Playwright + BeautifulSoup fallback",
            "images": "Stability AI → Pollinations.ai",
            "video": "Giphy → Tenor fallback",
        }
    }

@app.on_event("startup")
async def startup():
    logger.info("AuroraAI Service v2.0 starting up...")
    logger.info(f"Ollama model: {os.getenv('OLLAMA_MODEL', 'mistral')}")
    logger.info(f"Groq model: {os.getenv('GROQ_MODEL', 'mixtral-8x7b-32768')}")
    logger.info(f"Groq key configured: {'Yes' if os.getenv('GROQ_API_KEY') else 'No (fallback to mock)'}")
    logger.info(f"Stability AI key: {'Yes' if os.getenv('STABILITY_API_KEY') else 'No (using Pollinations)'}")
    logger.info(f"Embedding model: {os.getenv('EMBEDDING_MODEL', 'BAAI/bge-small-en-v1.5')}")

@app.on_event("shutdown")
async def shutdown():
    logger.info("AuroraAI Service shutting down.")

if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICE_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
