from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.services.redis_service import redis_service
from app.services.chroma_service import chroma_service
from app.services.pdf_service import PDFService
import os
import shutil
import httpx

router = APIRouter()
pdf_service = PDFService()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3001")

async def update_backend_status(document_id: int, status: str, page_count: int = None, error_message: str = None):
    """Update document status in backend"""
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{BACKEND_URL}/documents/{document_id}/status",
                json={
                    "status": status,
                    "page_count": page_count,
                    "error_message": error_message
                },
                timeout=10.0
            )
    except Exception as e:
        print(f"Failed to update backend status: {str(e)}")

async def handle_pdf_upload(channel: str, data: dict, redis_svc):
    """Handle PDF upload from Redis"""
    try:
        print(f"Received message on channel: {channel}")
        print(f"Message data: {data}")
        
        if channel == "pdf_upload":
            document_id = data.get("documentId")
            file_path = data.get("filePath")
            filename = data.get("filename")

            if not document_id or not file_path:
                print("Missing documentId or filePath")
                return

            print(f"Processing PDF: {filename} (ID: {document_id}, Path: {file_path})")

            # Ensure chroma service is initialized
            if chroma_service.collection is None:
                chroma_service.initialize()

            # Update status to processing
            await update_backend_status(document_id, "pending")

            # Extract text from PDF
            text, page_count = pdf_service.extract_text_from_pdf(file_path)

            # Split into chunks
            chunks, metadatas = pdf_service.split_text_into_chunks(text, document_id, filename)

            # Add to ChromaDB
            chroma_service.add_documents(document_id, chunks, metadatas)

            # Clean up uploaded file
            if os.path.exists(file_path):
                os.remove(file_path)

            # Update status to completed
            await update_backend_status(document_id, "completed", page_count=page_count)

            print(f"Processed PDF: {filename} (Document ID: {document_id}, Pages: {page_count}, Chunks: {len(chunks)})")

    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        import traceback
        traceback.print_exc()
        # Update status to failed
        if "documentId" in data:
            await update_backend_status(data.get("documentId"), "failed", error_message=str(e))

async def handle_pdf_delete(channel: str, data: dict):
    """Handle PDF delete from Redis"""
    try:
        if channel == "pdf_delete":
            document_id = data.get("documentId")
            filename = data.get("filename")

            if not document_id:
                return

            # Delete from ChromaDB
            chroma_service.delete_document(document_id)

            print(f"Deleted PDF from vector DB: {filename} (Document ID: {document_id})")

    except Exception as e:
        print(f"Error deleting PDF: {str(e)}")

@router.post("/process")
async def process_document(background_tasks: BackgroundTasks, data: dict):
    """Manual endpoint to process a document (for testing)"""
    try:
        document_id = data.get("documentId")
        file_path = data.get("filePath")
        filename = data.get("filename")

        if not document_id or not file_path:
            raise HTTPException(status_code=400, detail="Missing required fields")

        # Process in background
        background_tasks.add_task(handle_pdf_upload, "pdf_upload", data, redis_service)

        return {"status": "processing", "documentId": document_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
