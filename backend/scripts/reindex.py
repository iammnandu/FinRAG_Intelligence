from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.rag_service import rag_service


if __name__ == "__main__":
    result = rag_service.ingest()
    print(f"Indexed chunks: {result['indexed_chunks']}")
    print(f"Files processed: {result['files_processed']}")
