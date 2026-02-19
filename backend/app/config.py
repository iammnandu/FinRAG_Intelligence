from pathlib import Path

from dotenv import load_dotenv
import os

load_dotenv()


class Settings:
    ROOT_DIR = Path(__file__).resolve().parents[1]
    APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
    APP_PORT = int(os.getenv("APP_PORT", "8000"))

    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_CHAT_MODEL = os.getenv("OLLAMA_CHAT_MODEL", "llama3.1:8b")
    OLLAMA_EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")

    DATA_DIR = (ROOT_DIR / os.getenv("DATA_DIR", "data")).resolve()
    INDEX_DIR = (ROOT_DIR / os.getenv("INDEX_DIR", "store")).resolve()
    INDEX_FILE = INDEX_DIR / "vector_index.json"
    TOP_K = int(os.getenv("TOP_K", "4"))


settings = Settings()