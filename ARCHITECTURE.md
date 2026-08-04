# System Architecture

## Overview

This AI Knowledge Base Chatbot uses a microservice architecture with three main components:

1. **Next.js Frontend** - User interface for admin panel and public chat
2. **Node.js Backend** - API layer with authentication and document management
3. **Python AI Service** - PDF processing and RAG-based AI responses

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js Frontend                         │
│  ┌──────────────────┐              ┌──────────────────┐       │
│  │   Admin Panel    │              │   Chat Interface │       │
│  │  - Authentication │              │  - Public Chat   │       │
│  │  - PDF Upload    │              │  - Streaming     │       │
│  │  - Dashboard     │              │  - Markdown      │       │
│  └────────┬─────────┘              └────────┬─────────┘       │
└───────────┼──────────────────────────────────┼─────────────────┘
            │                                  │
            │ HTTP/REST                        │ HTTP/REST
            ▼                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Node.js Backend (NestJS)                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │   Auth Module    │  │  Documents Module│  │  Chat Module │ │
│  │  - JWT Auth      │  │  - PDF Upload    │  │  - Ask Q&A   │ │
│  │  - User Mgmt     │  │  - List/Delete   │  │  - History   │ │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘ │
└───────────┼──────────────────────┼───────────────────┼───────────┘
            │                      │                   │
            │                      │                   │
            │                      │                   │ Redis Pub/Sub
            │                      │                   │ (Async Communication)
            │                      │                   │
            ▼                      ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Redis Pub/Sub                           │
│  Channels:                                                       │
│  - pdf_upload    (Backend → AI Service)                          │
│  - pdf_delete    (Backend → AI Service)                          │
│  - chat_request  (Backend → AI Service)                          │
│  - chat_response (AI Service → Backend)                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Python AI Service (FastAPI)                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │  PDF Service     │  │  LangGraph        │  │ Chroma DB    │ │
│  │  - Text Extract  │  │  - Retrieve      │  │  - Vector    │ │
│  │  - Chunking      │  │  - Generate       │  │  - Search    │ │
│  │  - Embeddings    │  │  - Suggest Qs     │  │  - Store     │ │
│  └──────────────────┘  └────────┬─────────┘  └──────┬───────┘ │
└────────────────────────────────────┼──────────────────┼──────────┘
                                     │                  │
                                     │                  │
                                     ▼                  ▼
                            ┌────────────────────────────────┐
                            │         Vector Database        │
                            │         (ChromaDB)             │
                            └────────────────────────────────┘
                                     │
                                     │
                                     ▼
                            ┌────────────────────────────────┐
                            │          PostgreSQL            │
                            │  - Users                       │
                            │  - Documents                   │
                            │  - Chats                       │
                            └────────────────────────────────┘
```

## Component Details

### 1. Next.js Frontend

**Technologies:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- SHADCN UI components
- React Markdown
- Axios

**Features:**
- Admin Panel with authentication
- Dashboard with analytics
- PDF upload and management
- ChatGPT-style chat interface
- Streaming responses
- Markdown rendering
- Source citation
- Suggested follow-up questions

### 2. Node.js Backend

**Technologies:**
- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- Redis (ioredis)
- JWT Authentication
- Multer (file uploads)

**Modules:**
- **Auth Module**: JWT-based authentication, user management
- **Documents Module**: PDF upload, listing, deletion, reprocessing
- **Chat Module**: Question handling, chat history, statistics
- **Redis Module**: Pub/Sub communication with AI service

### 3. Python AI Service

**Technologies:**
- FastAPI
- LangChain
- LangGraph
- ChromaDB
- OpenAI API
- PyPDF
- Redis (async)

**Services:**
- **PDF Service**: Text extraction, chunking, embedding generation
- **Chroma Service**: Vector database operations
- **LangGraph Workflow**: RAG pipeline with:
  - Context retrieval
  - Answer generation
  - Suggested question generation

## Data Flow

### PDF Upload Flow

1. User uploads PDF via Admin Panel
2. Frontend sends file to Backend API
3. Backend saves file and creates document record
4. Backend publishes message to Redis `pdf_upload` channel
5. Python AI Service receives message
6. AI Service extracts text, splits into chunks, generates embeddings
7. AI Service stores vectors in ChromaDB
8. AI Service updates document status

### Chat Flow

1. User asks question via Chat Interface
2. Frontend sends question to Backend API
3. Backend generates unique request ID
4. Backend publishes request to Redis `chat_request` channel
5. Python AI Service receives request
6. AI Service runs LangGraph workflow:
   - Retrieves relevant context from ChromaDB
   - Generates answer using LLM
   - Generates suggested follow-up questions
7. AI Service publishes response to Redis `chat_response` channel
8. Backend receives response and sends to Frontend
9. Frontend displays answer with source and suggestions

## Redis Pub/Sub Communication

### Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `pdf_upload` | Backend → AI | Trigger PDF processing |
| `pdf_delete` | Backend → AI | Trigger PDF deletion from vector DB |
| `chat_request` | Backend → AI | Request AI response |
| `chat_response` | AI → Backend | Return AI response |

### Message Format

**PDF Upload Message:**
```json
{
  "documentId": 123,
  "filePath": "/uploads/file.pdf",
  "filename": "document.pdf"
}
```

**Chat Request Message:**
```json
{
  "requestId": "unique-id",
  "question": "User's question",
  "sessionId": "session-id"
}
```

**Chat Response Message:**
```json
{
  "requestId": "unique-id",
  "answer": "AI generated answer",
  "sourceDocument": "document.pdf",
  "pageNumber": 5,
  "suggestedQuestions": ["Q1", "Q2", "Q3"]
}
```

## Database Schema

### PostgreSQL Tables

**Users:**
- id (SERIAL PRIMARY KEY)
- email (VARCHAR UNIQUE)
- password (VARCHAR)
- created_at (TIMESTAMP)

**Documents:**
- id (SERIAL PRIMARY KEY)
- filename (VARCHAR)
- original_name (VARCHAR)
- file_size (INTEGER)
- page_count (INTEGER)
- processing_status (VARCHAR)
- error_message (TEXT)
- upload_date (TIMESTAMP)
- created_at (TIMESTAMP)

**Chats:**
- id (SERIAL PRIMARY KEY)
- session_id (VARCHAR)
- question (TEXT)
- answer (TEXT)
- source_document (VARCHAR)
- page_number (INTEGER)
- suggested_questions (JSONB)
- created_at (TIMESTAMP)

### ChromaDB Collection

**Collection:** `pdf_knowledge_base`

**Metadata Structure:**
```json
{
  "document_id": "123",
  "filename": "document.pdf",
  "chunk_index": 0,
  "source": "document.pdf"
}
```

## Security Considerations

1. **Authentication**: JWT-based authentication for admin panel
2. **Authorization**: Admin-only access to document management
3. **API Security**: CORS enabled for frontend, rate limiting recommended
4. **Environment Variables**: Sensitive data stored in environment files
5. **File Upload**: File type validation, size limits
6. **SQL Injection**: Parameterized queries via TypeORM
7. **XSS**: React's built-in XSS protection

## Scalability

The microservice architecture allows independent scaling:

1. **Frontend**: Can be deployed to Vercel/Netlify with CDN
2. **Backend**: Can be horizontally scaled behind load balancer
3. **AI Service**: Can be scaled based on processing load
4. **Redis**: Can use Redis Cluster for high availability
5. **PostgreSQL**: Can use read replicas for scaling reads
6. **ChromaDB**: Can be deployed in distributed mode

## Monitoring & Logging

Recommended monitoring points:
- API response times
- Redis message queue length
- PDF processing time
- AI response generation time
- Database query performance
- Error rates by service
