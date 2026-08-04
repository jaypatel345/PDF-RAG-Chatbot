# Setup Guide

This guide will help you set up the AI Knowledge Base Chatbot from scratch.

## Quick Start

### 1. System Requirements

- **Operating System**: macOS, Linux, or Windows with WSL2
- **Node.js**: v18 or higher
- **Python**: v3.10 or higher
- **Docker**: v20.10 or higher
- **Docker Compose**: v2.0 or higher
- **Git**: for cloning the repository

### 2. Verify Installations

```bash
# Check Node.js
node --version  # Should be v18+

# Check Python
python --version  # Should be 3.10+

# Check Docker
docker --version

# Check Docker Compose
docker-compose --version
```

## Detailed Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd AI-Chatbot
```

### Step 2: Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your editor
nano .env  # or use any text editor
```

**Required Variables:**
- `GROQ_API_KEY` - Get from https://console.groq.com/ (Free API key)

**Optional Variables** (use defaults for development):
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `REDIS_HOST`, `REDIS_PORT`
- `JWT_SECRET`
- `CHROMA_HOST`, `CHROMA_PORT`

### Step 3: Start Docker Services

```bash
# Start PostgreSQL, Redis, and ChromaDB
docker-compose up -d

# Verify services are running
docker-compose ps
```

Expected output:
```
NAME                    STATUS
ai_chatbot_chromadb     Up (healthy)
ai_chatbot_postgres     Up (healthy)
ai_chatbot_redis        Up (healthy)
```

### Step 4: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run database migrations
npm run migration:run

# Seed database with admin user
npm run seed
```

### Step 5: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local
```

### Step 6: Python AI Service Setup

```bash
cd python-ai

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

### Step 7: Start Development Servers

Open 3 separate terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Python AI Service:**
```bash
cd python-ai
source venv/bin/activate  # if using venv
uvicorn main:app --reload --port 8001
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 8: Verify Setup

1. **Check Backend**: Open http://localhost:3001 in browser
2. **Check AI Service**: Open http://localhost:8001/docs for API docs
3. **Check Frontend**: Open http://localhost:3000
4. **Test Admin Panel**: Navigate to http://localhost:3000/admin
5. **Test Chat**: Navigate to http://localhost:3000/chat

## Common Setup Issues

### Issue: Docker services won't start

**Solution:**
```bash
# Check Docker daemon is running
docker info

# Restart Docker Desktop (macOS/Windows)
# Or restart Docker service (Linux)
sudo systemctl restart docker

# Try starting services again
docker-compose up -d
```

### Issue: Node.js version too old

**Solution:**
```bash
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js 18
nvm install 18
nvm use 18
```

### Issue: Python version incompatible

**Solution:**
```bash
# Install pyenv (Python Version Manager)
# macOS:
brew install pyenv

# Linux:
curl https://pyenv.run | bash

# Install Python 3.10
pyenv install 3.10.0
pyenv local 3.10.0
```

### Issue: Port already in use

**Solution:**
```bash
# Find process using the port
lsof -i :3001  # Backend
lsof -i :8001  # AI Service
lsof -i :3000  # Frontend

# Kill the process
kill -9 <PID>

# Or change ports in .env files
```

### Issue: Database connection failed

**Solution:**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Re-run migrations
cd backend
npm run migration:run
```

### Issue: Groq API key invalid

**Solution:**
1. Verify your API key at https://console.groq.com/
2. Ensure you have a valid Groq account (free tier available)
3. Check the key is correctly set in `.env` file
4. Try regenerating the API key

### Issue: Redis connection failed

**Solution:**
```bash
# Check Redis is running
docker-compose ps redis

# Test Redis connection
redis-cli ping
# Should return: PONG

# Restart Redis
docker-compose restart redis
```

### Issue: ChromaDB connection failed

**Solution:**
```bash
# Check ChromaDB is running
docker-compose ps chromadb

# Check ChromaDB logs
docker-compose logs chromadb

# Restart ChromaDB
docker-compose restart chromadb

# Verify ChromaDB is accessible
curl http://localhost:8000/api/v1/heartbeat
```

## First Run Verification

### 1. Test Admin Login

1. Navigate to http://localhost:3000/admin
2. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`
3. You should be redirected to the dashboard

### 2. Test PDF Upload

1. In the admin dashboard, click "Select PDF"
2. Choose a PDF file from your computer
3. Wait for upload to complete
4. Check that the document appears in "Recent Documents"
5. Status should change from "pending" to "completed"

### 3. Test Chat

1. Navigate to http://localhost:3000/chat
2. Type a question related to your uploaded PDF
3. Press Enter
4. You should receive an AI response with:
   - Answer in markdown format
   - Source document citation
   - Suggested follow-up questions

## Production Setup

For production deployment, consider:

1. **Environment Variables**: Use strong secrets
2. **Database**: Use managed PostgreSQL service
3. **Redis**: Use managed Redis service
4. **File Storage**: Use cloud storage (S3, etc.)
5. **Domain**: Configure custom domain
6. **SSL/TLS**: Enable HTTPS
7. **Monitoring**: Set up logging and monitoring
8. **Scaling**: Configure load balancers

## Cleanup

To stop all services and clean up:

```bash
# Stop all services
docker-compose down

# Remove volumes (deletes all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Clean up backend
cd backend
rm -rf node_modules dist

# Clean up frontend
cd frontend
rm -rf node_modules .next

# Clean up Python AI service
cd python-ai
rm -rf venv __pycache__
```

## Getting Help

If you encounter issues not covered here:

1. Check the main [README.md](README.md)
2. Review [ARCHITECTURE.md](ARCHITECTURE.md)
3. Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
4. Look at service logs for detailed error messages
5. Verify all prerequisites are installed correctly

---

**Happy coding! 🚀**
