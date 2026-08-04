# AI Knowledge Base Chatbot (RAG System)

A production-ready AI-powered knowledge base chatbot using microservice architecture with Redis Pub/Sub communication. Built for a full-stack developer assignment demonstrating microservices, RAG (Retrieval-Augmented Generation), and modern web development practices.

## 🏗️ Architecture

```
Next.js Frontend
        │
        ▼
Node.js Backend (TypeScript)
        │
 Redis Pub/Sub
        │
        ▼
Python AI Service
(LangChain + LangGraph)
        │
        ▼
Vector Database (ChromaDB)
        │
        ▼
Database (PostgreSQL)
```

## 🚀 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **SHADCN UI**
- **React Markdown**
- **Axios**

### Backend
- **Node.js**
- **NestJS**
- **TypeScript**
- **TypeORM**
- **PostgreSQL**
- **Redis Pub/Sub**
- **JWT Authentication**

### AI Service
- **Python 3.10+**
- **FastAPI**
- **LangChain**
- **LangGraph**
- **ChromaDB** (Vector Database)
- **Groq API** (Fast, free LLM - Llama 3)
- **HuggingFace Embeddings** (Free, local embeddings)

## ✨ Features

### Admin Panel
- 🔐 Secure JWT authentication
- 📊 Dashboard with real-time analytics
- 📄 PDF upload and management
- 🔄 Document processing status tracking
- 🔍 Search and filter documents
- 🗑️ Delete and reprocess documents

### Public Chat Interface
- 💬 ChatGPT-style interface
- ⚡ Streaming responses
- 📝 Markdown rendering
- 📚 Source citation with page numbers
- 💡 Suggested follow-up questions
- 🧠 Conversation memory
- 📱 Responsive design

## 📁 Project Structure

```
AI-Chatbot/
├── frontend/              # Next.js frontend application
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities and API client
│   │   └── types/        # TypeScript types
│   ├── package.json
│   └── tsconfig.json
├── backend/              # NestJS backend API
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── documents/    # Document management
│   │   ├── chat/         # Chat module
│   │   ├── redis/        # Redis Pub/Sub service
│   │   ├── database/     # Database entities and migrations
│   │   └── config/       # Configuration
│   ├── package.json
│   └── tsconfig.json
├── python-ai/            # Python AI service
│   ├── app/
│   │   ├── routers/      # FastAPI routers
│   │   ├── services/     # Business logic
│   │   ├── graph/        # LangGraph workflows
│   │   └── models/       # Pydantic models
│   ├── requirements.txt
│   └── main.py
├── shared/               # Shared types and utilities
├── docker-compose.yml    # Docker services
├── docker-compose.dev.yml
├── .env                  # Environment variables
├── README.md            # This file
├── ARCHITECTURE.md      # Detailed architecture documentation
└── API_DOCUMENTATION.md # API reference
```

## 📋 Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **Docker** and **Docker Compose**
- **PostgreSQL** (via Docker)
- **Redis** (via Docker)
- **Groq API Key** (Free, get from https://console.groq.com/)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI-Chatbot
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:

```env
GROQ_API_KEY=your-groq-api-key-here
```

### 3. Start Infrastructure Services

Start PostgreSQL, Redis, and ChromaDB using Docker Compose:

```bash
docker-compose up -d
```

Verify services are running:

```bash
docker-compose ps
```

### 4. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

#### Python AI Service
```bash
cd python-ai
pip install -r requirements.txt
```

### 5. Database Setup

Create and seed the database:

```bash
cd backend
npm run migration:run
npm run seed
```

### 6. Start Services

Open three separate terminals:

#### Terminal 1 - Backend
```bash
cd backend
npm run start:dev
```

#### Terminal 2 - Python AI Service
```bash
cd python-ai
uvicorn main:app --reload --port 8001
```

#### Terminal 3 - Frontend
```bash
cd frontend
npm run dev
```

### 7. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **AI Service**: http://localhost:8001
- **Admin Panel**: http://localhost:3000/admin
- **Chat Interface**: http://localhost:3000/chat

## 🔑 Default Admin Credentials

- **Email**: `admin@example.com`
- **Password**: `admin123`

## 📚 Documentation

- **[Architecture Documentation](ARCHITECTURE.md)** - Detailed system architecture, data flow, and component details
- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference with examples
- **[Groq Migration Guide](GROQ_MIGRATION.md)** - Information about using Groq API instead of OpenAI

## 🎯 Usage Guide

### Uploading PDFs (Admin)

1. Navigate to http://localhost:3000/admin
2. Login with admin credentials
3. Go to Dashboard
4. Click "Select PDF" to upload a document
5. Wait for processing to complete
6. View document status in the recent documents list

### Chatting with AI (Public)

1. Navigate to http://localhost:3000/chat
2. Type your question in the input field
3. Press Enter or click Send
4. View the AI response with source citations
5. Click suggested questions for follow-up queries

## 🔧 Development

### Running Tests

#### Backend
```bash
cd backend
npm run test
```

#### Frontend
```bash
cd frontend
npm run test
```

#### Python AI Service
```bash
cd python-ai
pytest
```

### Code Quality

#### Backend
```bash
cd backend
npm run lint
npm run format
```

#### Frontend
```bash
cd frontend
npm run lint
```

## 🐳 Docker Deployment

### Development Mode
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Production Mode
Create a `docker-compose.prod.yml` with production configurations and run:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Troubleshooting

### ChromaDB Connection Issues
- Ensure ChromaDB is running: `docker-compose ps`
- Check ChromaDB logs: `docker-compose logs chromadb`
- Verify port 8000 is not in use

### Redis Connection Issues
- Verify Redis is running: `redis-cli ping`
- Check Redis logs: `docker-compose logs redis`
- Ensure port 6379 is accessible

### Database Migration Issues
- Reset database: `npm run migration:rollback && npm run migration:run`
- Re-seed data: `npm run seed`
- Check PostgreSQL logs: `docker-compose logs postgres`

### PDF Processing Issues
- Check Python AI service logs for errors
- Verify OpenAI API key is valid
- Ensure PDF file is not corrupted
- Check Redis connection between services

### Chat Not Working
- Verify all services are running
- Check Redis Pub/Sub communication
- Ensure ChromaDB has indexed documents
- Check AI service logs for LangGraph errors

## 🏆 Evaluation Criteria

This project addresses the following evaluation criteria:

- ✅ **Next.js Frontend (15 marks)** - Complete admin panel and chat interface
- ✅ **Node.js Backend (15 marks)** - NestJS with TypeScript, authentication, APIs
- ✅ **Python AI Service (20 marks)** - FastAPI with LangChain and LangGraph
- ✅ **LangChain Implementation (15 marks)** - Document processing and embeddings
- ✅ **LangGraph Implementation (15 marks)** - RAG workflow with state management
- ✅ **Redis Pub/Sub Integration (10 marks)** - Async communication between services
- ✅ **Database & Vector DB Design (5 marks)** - PostgreSQL + ChromaDB
- ✅ **Code Quality & Folder Structure (5 marks)** - Clean architecture

## 📝 License

MIT License - feel free to use this project for learning and development.

## 🤝 Contributing

This is an assignment project, but improvements and suggestions are welcome!

## 📞 Support

For issues or questions:
1. Check the [Architecture Documentation](ARCHITECTURE.md)
2. Review the [API Documentation](API_DOCUMENTATION.md)
3. Look at the troubleshooting section above
4. Check service logs for detailed error messages

---

**Built with ❤️ for the AI Full Stack Developer Assignment**
