# System Architecture Diagram

## Component Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                                │
│                   (Next.js Frontend - Port 3000)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Chat UI    │  │ Admin Panel  │  │  Upload UI   │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ HTTP/REST API
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      NESTJS BACKEND                                 │
│                     (Port 3001)                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Auth       │  │   Chat       │  │  Documents   │            │
│  │   Module     │  │   Module     │  │   Module     │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Redis      │  │   TypeORM    │  │   File       │            │
│  │   Service    │  │   Service    │  │   Storage    │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└──────┬─────────────────────┬──────────────────────┬───────────────┘
       │                     │                      │
       │ SQLite              │ Redis Pub/Sub        │ File System
       ↓                     ↓ (Port 6380)          ↓
┌──────────────┐    ┌──────────────────────┐  ┌──────────────┐
│  Document    │    │   MESSAGE BROKER     │  │   uploads/   │
│  Metadata    │    │                      │  │   Directory  │
│  Chat Logs   │    │  Channels:           │  └──────────────┘
│  User Data   │    │  • pdf_upload        │
└──────────────┘    │  • pdf_delete        │
                    │  • chat_request      │
                    │  • chat_response     │
                    └──────────┬───────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    PYTHON AI SERVICE                                 │
│                   (FastAPI - Port 8001)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Chat       │  │  Documents   │  │   Health     │            │
│  │   Router     │  │   Router     │  │   Check      │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Redis      │  │   Chroma     │  │   PDF        │            │
│  │   Service    │  │   Service    │  │   Service    │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  LangGraph   │  │   LangChain  │  │   Groq       │            │
│  │  Workflow    │  │   Pipeline   │  │   Client     │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└──────┬─────────────────────┬──────────────────────┬───────────────┘
       │                     │                      │
       ↓                     ↓                      ↓
┌──────────────┐    ┌──────────────┐      ┌──────────────┐
│  ChromaDB    │    │  Groq API    │      │  HTTP       │
│  Vector DB   │    │  (LLM)       │      │  Callback   │
│  (Local)     │    │  (External)  │      │  (Backend)  │
└──────────────┘    └──────────────┘      └──────────────┘
```

## Data Flow Diagrams

### PDF Upload Flow

```
User Upload PDF
     ↓
Frontend: POST /documents/upload
     ↓
Backend: Validate & Save File
     ↓
Backend: Create Document Record (SQLite)
     ↓
Backend: Publish to Redis (pdf_upload)
     ↓
Python AI: Receive Message
     ↓
Python AI: Extract Text (PyPDF2)
     ↓
Python AI: Split Chunks (LangChain)
     ↓
Python AI: Generate Embeddings
     ↓
Python AI: Store in ChromaDB
     ↓
Python AI: HTTP Callback (Update Status)
     ↓
Backend: Update Document Status
     ↓
Frontend: Poll & Update UI (5s interval)
```

### Chat Query Flow

```
User Asks Question
     ↓
Frontend: POST /chat/ask
     ↓
Backend: Generate Request ID
     ↓
Backend: Publish to Redis (chat_request)
     ↓
Backend: Wait for Response (30s timeout)
     ↓
Python AI: Receive Message
     ↓
Python AI: Retrieve Chunks (ChromaDB)
     ↓
Python AI: LangGraph Workflow
     ├─→ Retrieve Node
     ├─→ Generate Node (Groq LLM)
     └─→ Suggest Questions Node
     ↓
Python AI: Publish to Redis (chat_response)
     ↓
Backend: Receive Response
     ↓
Backend: Save to SQLite
     ↓
Backend: Return to Frontend
     ↓
Frontend: Display Answer + Suggestions
```

## Technology Stack Details

### Frontend Layer
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State**: React Hooks
- **HTTP**: Fetch API

### Backend Layer
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: SQLite (TypeORM)
- **Cache**: Redis (ioredis)
- **Auth**: JWT (Passport.js)
- **File Upload**: Multer

### AI Service Layer
- **Framework**: FastAPI
- **Language**: Python 3.13
- **Orchestration**: LangGraph
- **RAG**: LangChain
- **Vector DB**: ChromaDB
- **LLM**: Groq API (Llama 3 8B)
- **Embeddings**: HuggingFace (all-MiniLM-L6-v2)

## Communication Protocols

### Synchronous Communication
- **Frontend ↔ Backend**: HTTP/REST (JSON)
- **Backend ↔ Python AI**: HTTP Callback (Status updates)

### Asynchronous Communication
- **Backend ↔ Python AI**: Redis Pub/Sub
- **Channels**: pdf_upload, pdf_delete, chat_request, chat_response

## Data Storage

### Structured Data (SQLite)
- **Documents**: Metadata, processing status
- **Chats**: Conversation history, responses
- **Users**: Authentication data

### Unstructured Data (ChromaDB)
- **Vector Embeddings**: Document chunks
- **Metadata**: Source tracking
- **Index**: Cosine similarity search

### File Storage
- **PDF Files**: Local filesystem (uploads/)
- **Vector DB**: Local filesystem (chroma_db/)

## Security Considerations

1. **Authentication**: JWT tokens with expiration
2. **Authorization**: Role-based access control
3. **Data Validation**: Input validation on all endpoints
4. **Environment Variables**: Sensitive data in .env files
5. **File Upload**: Type and size validation
6. **Rate Limiting**: Potential DoS protection
7. **SQL Injection**: TypeORM parameterized queries
8. **XSS Protection**: React's built-in escaping

## Scalability Considerations

1. **Horizontal Scaling**: Stateless services
2. **Load Balancing**: Multiple backend instances
3. **Database**: Migration to PostgreSQL
4. **Vector DB**: Distributed ChromaDB
5. **Caching**: Redis for session management
6. **Queue**: Background job processing
7. **CDN**: Static asset delivery
8. **Monitoring**: Logging and metrics