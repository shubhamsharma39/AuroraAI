from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from services.llm_service import llm_service
from services.doc_service import doc_service
import os
import shutil
import uuid

router = APIRouter()

TEMP_UPLOAD_DIR = "temp_uploads"
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)

@router.post("/generate-content")
async def generate_content(data: dict):
    topic = data.get("topic")
    tone = data.get("tone", "professional")
    content_type = data.get("type", "blog post")
    
    if not topic:
        raise HTTPException(status_code=400, detail="Topic is required")
    
    content = await llm_service.generate_content(topic, tone, content_type)
    return {"content": content}

@router.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):
    doc_id = str(uuid.uuid4())
    file_path = os.path.join(TEMP_UPLOAD_DIR, f"{doc_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    doc_data, error = doc_service.process_document(doc_id, file_path)
    if error:
        raise HTTPException(status_code=500, detail=error)
    
    return {
        "doc_id": doc_id,
        "filename": file.filename,
        "summary": doc_data["summary"],
        "message": "Document processed successfully"
    }

@router.post("/ask-document")
async def ask_document(data: dict):
    doc_id = data.get("doc_id")
    question = data.get("question")
    
    if not doc_id or not question:
        raise HTTPException(status_code=400, detail="doc_id and question are required")
    
    context = doc_service.search(doc_id, question)
    if not context:
        raise HTTPException(status_code=404, detail="Document not found or no context retrieved")
    
    answer = await llm_service.chat_with_docs(question, context)
    return {"answer": answer}

@router.post("/universal-chat")
async def universal_chat(data: dict):
    message = data.get("message")
    history = data.get("history", [])
    attachments = data.get("attachments", [])
    doc_id = data.get("doc_id")
    
    if not message:
        raise HTTPException(status_code=400, detail="message is required")
        
    answer = await llm_service.universal_chat(message, history, attachments, doc_id)
    return {"answer": answer}
