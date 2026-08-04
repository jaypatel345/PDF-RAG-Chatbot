import os
import pypdf
from typing import List, Dict, Tuple
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings
from dotenv import load_dotenv

load_dotenv()

class PDFService:
    def __init__(self):
        self.chunk_size = int(os.getenv("CHUNK_SIZE", "1000"))
        self.chunk_overlap = int(os.getenv("CHUNK_OVERLAP", "200"))
        
        # Use HuggingFace embeddings (free, no API key needed)
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
        )

    def extract_text_from_pdf(self, file_path: str) -> Tuple[str, int]:
        """Extract text from PDF and return text with page count"""
        pdf_reader = pypdf.PdfReader(file_path)
        text = ""
        page_count = len(pdf_reader.pages)

        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"

        return text, page_count

    def split_text_into_chunks(self, text: str, document_id: int, filename: str) -> Tuple[List[str], List[Dict]]:
        """Split text into chunks with metadata"""
        chunks = self.text_splitter.split_text(text)
        
        metadatas = []
        for i, chunk in enumerate(chunks):
            metadatas.append({
                "document_id": str(document_id),
                "filename": filename,
                "chunk_index": i,
                "source": filename
            })

        return chunks, metadatas

    def generate_embeddings(self, chunks: List[str]) -> List[List[float]]:
        """Generate embeddings for text chunks"""
        embeddings = self.embeddings.embed_documents(chunks)
        return embeddings

pdf_service = PDFService()
