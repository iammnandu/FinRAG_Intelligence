from __future__ import annotations

import json
from pathlib import Path
import math

from pypdf import PdfReader

from app.config import settings
from app.ollama_client import ollama_client


class RAGService:
    def __init__(self) -> None:
        settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
        settings.INDEX_DIR.mkdir(parents=True, exist_ok=True)
        self.index: list[dict] = []
        self._load_index()

    def _load_index(self) -> None:
        if settings.INDEX_FILE.exists():
            self.index = json.loads(settings.INDEX_FILE.read_text(encoding="utf-8"))
        else:
            self.index = []

    def _save_index(self) -> None:
        settings.INDEX_FILE.write_text(
            json.dumps(self.index, ensure_ascii=False),
            encoding="utf-8",
        )

    def _chunk_text(self, text: str, chunk_size: int = 900, overlap: int = 150) -> list[str]:
        cleaned = " ".join(text.split())
        if not cleaned:
            return []
        chunks: list[str] = []
        start = 0
        while start < len(cleaned):
            end = min(start + chunk_size, len(cleaned))
            chunks.append(cleaned[start:end])
            if end == len(cleaned):
                break
            start = max(0, end - overlap)
        return chunks

    def _read_file(self, path: Path) -> str:
        suffix = path.suffix.lower()
        if suffix in {".txt", ".md"}:
            return path.read_text(encoding="utf-8", errors="ignore")
        if suffix == ".json":
            payload = json.loads(path.read_text(encoding="utf-8", errors="ignore"))
            return json.dumps(payload, ensure_ascii=False, indent=2)
        if suffix == ".pdf":
            reader = PdfReader(str(path))
            pages = [page.extract_text() or "" for page in reader.pages]
            return "\n".join(pages)
        return ""

    def ingest(self) -> dict:
        candidates = [
            p
            for p in settings.DATA_DIR.rglob("*")
            if p.is_file() and p.suffix.lower() in {".txt", ".md", ".json", ".pdf"}
        ]
        next_index: list[dict] = []
        for file_path in candidates:
            raw_text = self._read_file(file_path)
            chunks = self._chunk_text(raw_text)
            for idx, chunk in enumerate(chunks):
                embedding = ollama_client.embed(chunk)
                if not embedding:
                    continue
                next_index.append(
                    {
                        "id": f"{file_path.name}-{idx}",
                        "source": str(file_path.relative_to(settings.DATA_DIR)),
                        "text": chunk,
                        "embedding": embedding,
                    }
                )
        self.index = next_index
        self._save_index()
        return {"indexed_chunks": len(next_index), "files_processed": len(candidates)}

    def _cosine_similarity(self, vector_a: list[float], vector_b: list[float]) -> float:
        if not vector_a or not vector_b or len(vector_a) != len(vector_b):
            return 0.0
        dot = sum(a * b for a, b in zip(vector_a, vector_b))
        norm_a = math.sqrt(sum(a * a for a in vector_a))
        norm_b = math.sqrt(sum(b * b for b in vector_b))
        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0
        return dot / (norm_a * norm_b)

    def retrieve(self, query: str, top_k: int) -> list[dict]:
        if not self.index:
            return []
        query_embedding = ollama_client.embed(query)
        scored: list[dict] = []
        for item in self.index:
            score = self._cosine_similarity(query_embedding, item["embedding"])
            scored.append({**item, "score": score})
        scored.sort(key=lambda row: row["score"], reverse=True)
        return scored[:top_k]

    def answer(self, question: str, history: list[dict], top_k: int) -> dict:
        retrieved = self.retrieve(question, top_k)
        context_blocks = [
            f"Source: {item['source']}\nContent: {item['text']}" for item in retrieved
        ]
        context = "\n\n".join(context_blocks)
        history_text = "\n".join(
            [f"{message.get('role', 'user')}: {message.get('content', '')}" for message in history[-8:]]
        )

        prompt = (
            "You are a cybersecurity and fraud intelligence assistant for banking. "
            "Answer clearly and accurately using ONLY the provided context whenever possible. "
            "If information is missing, explicitly state what is missing and suggest safe next steps.\n\n"
            f"Conversation history:\n{history_text}\n\n"
            f"Context:\n{context}\n\n"
            f"User question: {question}\n\n"
            "Response format: concise explanation, risk level if relevant, and practical actions."
        )

        answer = ollama_client.generate(prompt)
        citations = [
            {"source": item["source"], "score": round(item["score"], 4)} for item in retrieved
        ]
        return {
            "answer": answer,
            "citations": citations,
            "retrieved_chunks": len(retrieved),
        }


rag_service = RAGService()