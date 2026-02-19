from pydantic import BaseModel, Field
from typing import Optional


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=2)
    history: list[ChatMessage] = Field(default_factory=list)
    top_k: Optional[int] = None


class Citation(BaseModel):
    source: str
    score: float


class ChatResponse(BaseModel):
    answer: str
    citations: list[Citation]
    retrieved_chunks: int


class IngestResponse(BaseModel):
    indexed_chunks: int
    files_processed: int
