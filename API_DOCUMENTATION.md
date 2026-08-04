# API Documentation

## Base URL

- **Backend API**: `http://localhost:3001`
- **Python AI Service**: `http://localhost:8001`

## Authentication

Most admin endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Admin APIs

### 1. Login

Authenticate as admin and receive JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com"
  }
}
```

### 2. Get Profile

Get current authenticated user profile.

**Endpoint:** `GET /auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "email": "admin@example.com"
}
```

### 3. Upload PDF

Upload a PDF document to the knowledge base.

**Endpoint:** `POST /documents/upload`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file`: PDF file

**Response:**
```json
{
  "id": 1,
  "filename": "abc123.pdf",
  "original_name": "document.pdf",
  "file_size": 1024000,
  "page_count": null,
  "processing_status": "pending",
  "error_message": null,
  "upload_date": "2024-01-01T00:00:00.000Z",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### 4. List All Documents

Get all uploaded documents.

**Endpoint:** `GET /documents`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 1,
    "filename": "abc123.pdf",
    "original_name": "document.pdf",
    "file_size": 1024000,
    "page_count": 10,
    "processing_status": "completed",
    "error_message": null,
    "upload_date": "2024-01-01T00:00:00.000Z",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### 5. Search Documents

Search documents by filename.

**Endpoint:** `GET /documents/search?q=<query>`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `q`: Search query string

**Response:**
```json
[
  {
    "id": 1,
    "filename": "abc123.pdf",
    "original_name": "document.pdf",
    "file_size": 1024000,
    "page_count": 10,
    "processing_status": "completed",
    "error_message": null,
    "upload_date": "2024-01-01T00:00:00.000Z",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### 6. Get Dashboard Stats

Get dashboard statistics and recent documents.

**Endpoint:** `GET /documents/dashboard`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "totalPDFs": 10,
  "processedPDFs": 8,
  "pendingPDFs": 2,
  "recentDocuments": []
}
```

### 7. Get Document by ID

Get a specific document by ID.

**Endpoint:** `GET /documents/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "filename": "abc123.pdf",
  "original_name": "document.pdf",
  "file_size": 1024000,
  "page_count": 10,
  "processing_status": "completed",
  "error_message": null,
  "upload_date": "2024-01-01T00:00:00.000Z",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### 8. Delete Document

Delete a document from the knowledge base.

**Endpoint:** `DELETE /documents/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Document deleted successfully"
}
```

### 9. Reprocess Document

Reprocess a document (re-extract and re-index).

**Endpoint:** `POST /documents/:id/reprocess`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "filename": "abc123.pdf",
  "original_name": "document.pdf",
  "file_size": 1024000,
  "page_count": null,
  "processing_status": "pending",
  "error_message": null,
  "upload_date": "2024-01-01T00:00:00.000Z",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

## Chat APIs

### 1. Ask Question

Ask a question to the AI chatbot.

**Endpoint:** `POST /chat/ask`

**Request Body:**
```json
{
  "question": "What is the refund policy?",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "sessionId": "abc123",
  "question": "What is the refund policy?",
  "answer": "The refund policy allows returns within 30 days...",
  "source_document": "policy.pdf",
  "page_number": 5,
  "suggested_questions": [
    "How do I request a refund?",
    "What items are not refundable?",
    "How long does refund processing take?"
  ]
}
```

### 2. Get Chat History

Get chat history for a session.

**Endpoint:** `GET /chat/history/:sessionId`

**Response:**
```json
[
  {
    "id": 1,
    "session_id": "abc123",
    "question": "What is the refund policy?",
    "answer": "The refund policy allows returns within 30 days...",
    "source_document": "policy.pdf",
    "page_number": 5,
    "suggested_questions": [
      "How do I request a refund?",
      "What items are not refundable?",
      "How long does refund processing take?"
    ],
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### 3. Get Chat Statistics

Get overall chat statistics.

**Endpoint:** `GET /chat/stats`

**Response:**
```json
{
  "totalChats": 100,
  "totalSessions": 45
}
```

## Python AI Service APIs

### 1. Health Check

Check if the AI service is running.

**Endpoint:** `GET /`

**Response:**
```json
{
  "message": "AI Chatbot Service is running"
}
```

### 2. Health Status

Detailed health status.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy"
}
```

### 3. Process Document (Manual)

Manually trigger document processing (for testing).

**Endpoint:** `POST /api/documents/process`

**Request Body:**
```json
{
  "documentId": 1,
  "filePath": "/uploads/file.pdf",
  "filename": "document.pdf"
}
```

**Response:**
```json
{
  "status": "processing",
  "documentId": 1
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "statusCode": 400,
  "message": "Error message description",
  "error": "Bad Request"
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required or invalid
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Default Limit**: 100 requests per minute per IP
- **Headers Included**:
  - `X-RateLimit-Limit`: Request limit per window
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets

## WebSocket/Streaming

For streaming chat responses, the frontend uses Server-Sent Events (SSE) pattern through the HTTP long-polling mechanism implemented in the Redis Pub/Sub system.

## Redis Communication

The backend and AI service communicate through Redis Pub/Sub. These are internal channels and not exposed via public API:

- `pdf_upload` - Backend publishes PDF upload events
- `pdf_delete` - Backend publishes PDF deletion events
- `chat_request` - Backend publishes chat requests
- `chat_response` - AI service publishes chat responses

## Testing the API

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

**Upload PDF:**
```bash
curl -X POST http://localhost:3001/documents/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@document.pdf"
```

**Ask Question:**
```bash
curl -X POST http://localhost:3001/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the refund policy?"}'
```

### Using Postman

1. Import the API endpoints
2. Set base URL to `http://localhost:3001`
3. For authenticated endpoints, add JWT token to Authorization header
4. Use multipart/form-data for file uploads
