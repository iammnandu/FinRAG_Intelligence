from pathlib import Path
import re

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.rag_service import rag_service
from app.schemas import ChatRequest, ChatResponse, IngestResponse

app = FastAPI(title="FinRAG Cybersecurity & Fraud Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _safe_filename(name: str) -> str:
    sanitized = re.sub(r"[^a-zA-Z0-9._-]", "_", name)
    return sanitized[:120] or "uploaded_file.txt"


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "index_chunks": len(rag_service.index),
        "chat_model": settings.OLLAMA_CHAT_MODEL,
        "embed_model": settings.OLLAMA_EMBED_MODEL,
    }


@app.get("/api/documents")
def documents() -> dict:
    files = [
        str(path.relative_to(settings.DATA_DIR))
        for path in settings.DATA_DIR.rglob("*")
        if path.is_file()
    ]
    return {"count": len(files), "documents": sorted(files)}


@app.post("/api/ingest", response_model=IngestResponse)
def ingest() -> IngestResponse:
    try:
        result = rag_service.ingest()
        return IngestResponse(**result)
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)) -> dict:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")
    destination = settings.DATA_DIR / _safe_filename(file.filename)
    content = await file.read()
    destination.write_bytes(content)
    return {"message": "Uploaded", "file": str(destination.relative_to(settings.DATA_DIR))}


@app.post("/api/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    try:
        top_k = payload.top_k or settings.TOP_K
        result = rag_service.answer(
            question=payload.question,
            history=[message.model_dump() for message in payload.history],
            top_k=max(1, min(top_k, 8)),
        )
        return ChatResponse(**result)
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error


@app.get("/")
def root() -> dict:
    return {"message": "FinRAG backend is running", "docs": "/docs"}
