# AI Chatbot with RAG - Full Stack Application

A modern AI-powered chatbot application that allows users to upload PDF documents and ask questions about their content using Retrieval-Augmented Generation (RAG). Built with Next.js, NestJS, Python/FastAPI, LangChain, LangGraph, and Redis.

## 🚀 Features

- **PDF Upload & Processing**: Upload multiple PDFs with automatic text extraction and indexing
- **AI-Powered Chat**: Ask questions about uploaded documents with context-aware responses
- **Real-time Status Updates**: Live document processing status without page refresh
- **Follow-up Questions**: Maintain conversation context for better accuracy
- **Suggested Questions**: AI generates relevant follow-up questions
- **Source Attribution**: Answers include source document and page number
- **Multi-Document Support**: Query across multiple uploaded PDFs simultaneously
- **Admin Dashboard**: Manage documents, view statistics, and monitor processing

## �️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State Management**: React Hooks

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: SQLite (TypeORM)
- **Cache**: Redis
- **Authentication**: JWT (Passport.js)

### AI Service
- **Framework**: FastAPI
- **Language**: Python 3.13
- **RAG**: LangChain
- **Workflow**: LangGraph
- **Vector DB**: ChromaDB
- **LLM**: Groq API (Llama 3 8B)
- **Embeddings**: HuggingFace (all-MiniLM-L6-v2)

## 📋 Prerequisites

- Node.js 18+
- Python 3.13+
- Redis server
- Groq API key

## 🏗️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI-Chatbot
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env` with your configuration:
```env
DATABASE_URL=sqlite:./database.sqlite
JWT_SECRET=your_jwt_secret_here
REDIS_HOST=localhost
REDIS_PORT=6380
```

Start the backend:
```bash
npm run start:dev
```

Backend runs on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the frontend:
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

### 4. Python AI Service Setup

```bash
cd python-ai
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Set environment variables:
```bash
export GROQ_API_KEY=your_groq_api_key
export REDIS_HOST=localhost
export REDIS_PORT=6380
export BACKEND_URL=http://localhost:3001
```

Start the Python service:
```bash
python -m uvicorn main:app --reload --port 8001
```

Python service runs on `http://localhost:8001`

### 5. Redis Setup

Start Redis on port 6380:
```bash
redis-server --port 6380
```

## 🎯 Usage

### 1. Access the Application

- **Frontend**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Chat Interface**: http://localhost:3000/chat

### 2. Admin Login

Default credentials:
- **Email**: admin@example.com
- **Password**: admin123

### 3. Upload PDFs

1. Navigate to Admin Dashboard
2. Click "Select PDF" button
3. Choose a PDF file
4. Watch the processing status update in real-time

### 4. Chat with Documents

1. Navigate to Chat Interface
2. Ask questions about uploaded documents
3. View AI responses with source attribution
4. Use suggested follow-up questions

## 📁 Project Structure

```
AI-Chatbot/
├── frontend/              # Next.js Frontend
│   ├── src/
│   │   ├── app/          # Pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities & API
│   │   └── types/        # TypeScript types
│   └── package.json
├── backend/              # NestJS Backend
│   ├── src/
│   │   ├── auth/         # Authentication
│   │   ├── chat/         # Chat module
│   │   ├── documents/    # Document management
│   │   └── redis/        # Redis service
│   ├── uploads/          # File storage
│   └── package.json
├── python-ai/            # Python AI Service
│   ├── app/
│   │   ├── routers/      # FastAPI routes
│   │   ├── services/     # Business logic
│   │   ├── graph/        # LangGraph workflow
│   │   └── models/       # Pydantic models
│   ├── main.py
│   ├── requirements.txt
│   └── chroma_db/        # Vector database
└── README.md
```

## 🔧 API Documentation

### Backend API (Port 3001)

#### Authentication
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

#### Documents
```http
# Upload PDF
POST /documents/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

# Get all documents
GET /documents
Authorization: Bearer {token}

# Get dashboard stats
GET /documents/dashboard
Authorization: Bearer {token}

# Delete document
DELETE /documents/:id
Authorization: Bearer {token}
```

#### Chat
```http
# Ask question
POST /chat/ask
Content-Type: application/json

{
  "question": "What is the main topic?",
  "sessionId": "session_123"
}

# Get chat history
GET /chat/history/:sessionId
```

### Python AI Service (Port 8001)

#### Health Check
```http
GET /health
```

## 🏗️ Architecture

The application uses a three-tier architecture:

1. **Frontend**: Next.js for user interface
2. **Backend**: NestJS for API and business logic
3. **AI Service**: FastAPI for AI processing

**Communication**:
- Frontend ↔ Backend: HTTP/REST
- Backend ↔ AI Service: Redis Pub/Sub
- AI Service ↔ Backend: HTTP callbacks

**Data Storage**:
- SQLite: Document metadata, chat history
- ChromaDB: Vector embeddings for semantic search
- Redis: Message broker and caching

## 🔐 Security

- JWT authentication for admin access
- Environment variable protection
- File upload validation
- SQL injection prevention (TypeORM)
- XSS protection (React built-in)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Python tests
cd python-ai
pytest
```

## 📊 Environment Variables

### Backend (.env)
```env
DATABASE_URL=sqlite:./database.sqlite
JWT_SECRET=your_jwt_secret
REDIS_HOST=localhost
REDIS_PORT=6380
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Python AI Service
```env
GROQ_API_KEY=your_groq_api_key
REDIS_HOST=localhost
REDIS_PORT=6380
BACKEND_URL=http://localhost:3001
```

## � Deployment

### Docker Deployment (Recommended)

```bash
# Build and start all services
docker-compose up -d
```

### Manual Deployment

1. Deploy backend to hosting service (Vercel, AWS, etc.)
2. Deploy frontend to hosting service (Vercel, Netlify, etc.)
3. Deploy Python service to hosting service (Render, Railway, etc.)
4. Set up managed Redis (Redis Cloud, AWS ElastiCache)
5. Configure environment variables
6. Update API URLs in frontend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- LangChain for the RAG framework
- LangGraph for workflow orchestration
- Groq for fast LLM inference
- ChromaDB for vector storage
- shadcn/ui for beautiful components

## � Contact

For questions or support, please open an issue on GitHub.

## 📚 Additional Documentation

- [Project Documentation](./PROJECT_DOCUMENTATION.md) - Comprehensive technical details
- [Architecture Diagram](./ARCHITECTURE.md) - System architecture and data flow
- [Database Schema](./DATABASE_SCHEMA.md) - Database structure and relationships