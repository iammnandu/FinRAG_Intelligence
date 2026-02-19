# FinRAG Backend (Python)

FastAPI backend for Cybersecurity & Fraud Intelligence Chatbot with RAG + Ollama.

## Features
- FastAPI REST API with CORS enabled
- Local document ingestion from `data/` (`.txt`, `.md`, `.json`, `.pdf`)
- Vector index build using Ollama embeddings
- Retrieval + grounded answer generation using Ollama LLM
- File upload endpoint for adding new knowledge docs

## API Endpoints
- `GET /health`
- `GET /api/documents`
- `POST /api/upload`
- `POST /api/ingest`
- `POST /api/chat`

## Setup
1. Create Python env and install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Copy env file:
   ```bash
   cp .env.example .env
   ```
3. Ensure Ollama is installed and running, then pull models:
   ```bash
   ollama pull llama3.1:8b
   ollama pull nomic-embed-text
   ```
4. Index local knowledge files:
   ```bash
   python scripts/reindex.py
   ```
5. Run API server:
   ```bash
   python server.py
   ```

Open Swagger docs at `http://localhost:8000/docs`.
