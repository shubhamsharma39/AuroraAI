"""
AuroraAI Document Service — Upgraded
Embedding Model: BAAI/bge-small-en-v1.5 (replaces all-MiniLM-L6-v2)
- Better semantic accuracy
- Optimized for retrieval tasks
- Fully FAISS-compatible
"""

import os
import logging
import faiss
import numpy as np
from pypdf import PdfReader
from docx import Document
from sentence_transformers import SentenceTransformer

logger = logging.getLogger("aurora.doc")

# Load from env or use default BGE model
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5")

class DocService:
    def __init__(self):
        logger.info(f"Loading embedding model: {EMBEDDING_MODEL}")
        self.model = SentenceTransformer(EMBEDDING_MODEL)
        self.indices = {}  # In-memory doc ID → {index, chunks, summary}
        # BGE models need a query prefix for best retrieval accuracy
        self._query_prefix = "Represent this sentence for searching relevant passages: "
        logger.info("Embedding model loaded successfully.")

    def extract_text(self, file_path: str) -> str:
        ext = os.path.splitext(file_path)[1].lower()
        text = ""
        try:
            if ext == ".pdf":
                reader = PdfReader(file_path)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            elif ext == ".docx":
                doc = Document(file_path)
                text = "\n".join(para.text for para in doc.paragraphs)
            else:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
        except Exception as e:
            logger.error(f"Text extraction failed for {file_path}: {e}")
        return text.strip()

    def chunk_text(self, text: str, chunk_size: int = 400, overlap: int = 50) -> list:
        """
        Chunking with overlap to avoid losing context at chunk boundaries.
        """
        words = text.split()
        chunks = []
        step = chunk_size - overlap
        for i in range(0, len(words), step):
            chunk = " ".join(words[i: i + chunk_size])
            if chunk:
                chunks.append(chunk)
        return chunks

    def process_document(self, doc_id: str, file_path: str):
        """
        Vectorize and index a document using BGE embeddings + FAISS.
        Returns (index_data, error_message)
        """
        text = self.extract_text(file_path)
        if not text:
            return None, "No text could be extracted from the document."

        chunks = self.chunk_text(text)
        if not chunks:
            return None, "Document produced no usable text chunks."

        logger.info(f"Indexing {len(chunks)} chunks for doc_id={doc_id}")

        # BGE: encode passages without prefix (prefix only for queries)
        embeddings = self.model.encode(chunks, normalize_embeddings=True, show_progress_bar=False)
        embeddings = np.array(embeddings, dtype="float32")

        # FAISS IndexFlatIP works well with normalized vectors (cosine similarity)
        dimension = embeddings.shape[1]
        index = faiss.IndexFlatIP(dimension)
        index.add(embeddings)

        self.indices[doc_id] = {
            "index": index,
            "chunks": chunks,
            "summary": chunks[0][:400] + "..." if len(chunks[0]) > 400 else chunks[0],
            "dimension": dimension,
            "num_chunks": len(chunks),
        }

        logger.info(f"Document {doc_id} indexed: {len(chunks)} chunks, dim={dimension}")
        return self.indices[doc_id], None

    def search(self, doc_id: str, query: str, k: int = 4) -> str:
        """
        Retrieve top-k relevant chunks for a query using cosine similarity.
        BGE query prefix is automatically applied for best accuracy.
        """
        if doc_id not in self.indices:
            logger.warning(f"Doc ID '{doc_id}' not found in index.")
            return None

        # Apply BGE query prefix for better retrieval accuracy
        prefixed_query = self._query_prefix + query
        query_embedding = self.model.encode(
            [prefixed_query], normalize_embeddings=True
        ).astype("float32")

        index_data = self.indices[doc_id]
        actual_k = min(k, index_data["num_chunks"])
        distances, indices = index_data["index"].search(query_embedding, actual_k)

        # Filter out invalid indices (FAISS returns -1 for unfound)
        results = [
            index_data["chunks"][i]
            for i in indices[0]
            if 0 <= i < len(index_data["chunks"])
        ]

        logger.info(f"Doc search for '{query[:40]}...' → {len(results)} chunks returned")
        return "\n\n".join(results) if results else None

    def get_doc_info(self, doc_id: str) -> dict:
        """Returns metadata about an indexed document."""
        info = self.indices.get(doc_id, {})
        return {k: v for k, v in info.items() if k not in ("index", "chunks")}

    def list_docs(self) -> list:
        return list(self.indices.keys())


# Module-level singleton
doc_service = DocService()
