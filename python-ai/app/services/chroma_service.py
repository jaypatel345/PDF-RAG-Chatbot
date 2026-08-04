import chromadb
from chromadb.config import Settings
import os
from typing import List, Dict, Optional

class ChromaService:
    def __init__(self):
        self.client: Optional[chromadb.Client] = None
        self.collection = None
        self.host = os.getenv("CHROMA_HOST", "localhost")
        self.port = int(os.getenv("CHROMA_PORT", "8000"))

    def initialize(self):
        # Use persistent storage instead of HTTP client
        self.client = chromadb.PersistentClient(path="./chroma_db")
        # Get or create collection
        try:
            self.collection = self.client.get_collection(name="pdf_knowledge_base")
            print(f"ChromaDB collection loaded: {self.collection.name}")
        except Exception as e:
            print(f"Creating new ChromaDB collection: {str(e)}")
            self.collection = self.client.create_collection(
                name="pdf_knowledge_base",
                metadata={"hnsw:space": "cosine"}
            )
            print(f"ChromaDB collection created: {self.collection.name}")

    def add_documents(
        self,
        document_id: int,
        chunks: List[str],
        metadatas: List[Dict]
    ):
        ids = [f"{document_id}_{i}" for i in range(len(chunks))]
        self.collection.add(
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )

    def search_documents(
        self,
        query: str,
        n_results: int = 5
    ) -> Dict:
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        return results

    def delete_document(self, document_id: int):
        if self.collection is None:
            print("ChromaDB collection not initialized")
            return
        # Get all document IDs for this document
        all_ids = self.collection.get()
        document_ids = [
            id for id in all_ids['ids']
            if id.startswith(f"{document_id}_")
        ]
        if document_ids:
            self.collection.delete(ids=document_ids)
            print(f"Deleted {len(document_ids)} chunks for document {document_id}")

    def get_collection_stats(self) -> Dict:
        count = self.collection.count()
        return {"total_documents": count}

chroma_service = ChromaService()
