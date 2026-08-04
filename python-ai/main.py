import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat, documents
from app.services.redis_service import RedisService
from app.services.chroma_service import ChromaService

redis_service = RedisService()
chroma_service = ChromaService()

async def redis_listener():
    """Background task to listen for Redis messages"""
    async def handler(channel: str, data: dict):
        if channel == "chat_request":
            await chat.handle_chat_request(channel, data, redis_service)
        elif channel == "pdf_upload":
            await documents.handle_pdf_upload(channel, data, redis_service)
        elif channel == "pdf_delete":
            await documents.handle_pdf_delete(channel, data)
    
    await redis_service.listen(handler)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting application lifespan...")
    await redis_service.connect()
    chroma_service.initialize()
    
    # Start Redis listener in background
    print("Starting Redis listener...")
    asyncio.create_task(redis_listener())
    
    yield
    # Shutdown
    print("Shutting down...")
    await redis_service.disconnect()

app = FastAPI(
    title="AI Chatbot Service",
    description="Python AI service for PDF processing and RAG-based chatbot",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])

@app.get("/")
async def root():
    return {"message": "AI Chatbot Service is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
