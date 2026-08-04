# Database Schema Documentation

## SQLite Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
```

**Purpose**: Store user authentication credentials
**Security**: Passwords should be hashed (bcrypt) in production

### Documents Table
```sql
CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  processing_status VARCHAR(50) DEFAULT 'pending',
  page_count INTEGER,
  error_message TEXT,
  upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_documents_status ON documents(processing_status);
CREATE INDEX idx_documents_upload_date ON documents(upload_date);
```

**Status Values**:
- `pending`: Document uploaded, waiting for processing
- `processing`: Currently being processed by AI service
- `completed`: Successfully processed and indexed
- `failed`: Processing error occurred

**Purpose**: Track PDF documents and their processing status

### Chats Table
```sql
CREATE TABLE chats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  source_document VARCHAR(255),
  page_number INTEGER,
  suggested_questions TEXT, -- JSON array of strings
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_chats_session ON chats(session_id);
CREATE INDEX idx_chats_created_at ON chats(created_at);
```

**suggested_questions Format**:
```json
["Question 1?", "Question 2?", "Question 3?"]
```

**Purpose**: Store conversation history and AI responses

## Entity Relationships

```
Users (1) ── (N) Documents  (One user can upload multiple documents)
Users (1) ── (N) Chats     (One user can have multiple chat sessions)
Documents (1) ── (N) Chats (Multiple chats can reference same document)
```

## ChromaDB Vector Schema

### Collection: `pdf_knowledge_base`

**Configuration**:
- **Embedding Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Dimension**: 384 (embedding dimensions)
- **Distance Metric**: Cosine similarity
- **Storage**: Persistent local storage

### Document Structure

```json
{
  "ids": ["{document_id}_{chunk_index}"],
  "documents": ["Text chunk content..."],
  "metadatas": [
    {
      "document_id": 1,
      "filename": "document.pdf",
      "page_number": 1,
      "chunk_index": 0,
      "chunk_size": 1000
    }
  ]
}
```

### Chunking Strategy

- **Chunk Size**: 1000 characters
- **Overlap**: 200 characters
- **Splitter**: RecursiveCharacterTextSplitter (LangChain)
- **Purpose**: Maintain context while ensuring manageable chunk sizes

### Metadata Fields

| Field | Type | Description |
|-------|------|-------------|
| document_id | Integer | Reference to SQLite document ID |
| filename | String | Original filename for source attribution |
| page_number | Integer | Page number in original PDF |
| chunk_index | Integer | Index of chunk within document |
| chunk_size | Integer | Character count of chunk |

## Query Patterns

### SQLite Queries

**Get Recent Documents**:
```sql
SELECT * FROM documents 
ORDER BY upload_date DESC 
LIMIT 10;
```

**Get Document Stats**:
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN processing_status = 'completed' THEN 1 ELSE 0 END) as processed,
  SUM(CASE WHEN processing_status = 'pending' THEN 1 ELSE 0 END) as pending
FROM documents;
```

**Get Chat History**:
```sql
SELECT * FROM chats 
WHERE session_id = ? 
ORDER BY created_at ASC;
```

### ChromaDB Queries

**Semantic Search**:
```python
results = collection.query(
    query_texts=["user question"],
    n_results=5,
    where={"document_id": {"$in": [1, 2, 3]}}
)
```

**Delete Document**:
```python
# Get all chunk IDs for document
document_ids = [id for id in all_ids['ids'] 
                 if id.startswith(f"{document_id}_")]
# Delete from collection
collection.delete(ids=document_ids)
```

## Data Migration Strategy

### SQLite Migration
```sql
-- Add new columns if needed
ALTER TABLE documents ADD COLUMN tags TEXT;
ALTER TABLE chats ADD COLUMN model_used VARCHAR(50);
```

### ChromaDB Migration
```python
# Backup existing collection
collection = client.get_collection("pdf_knowledge_base")
data = collection.get()

# Create new collection with updated config
new_collection = client.create_collection(
    name="pdf_knowledge_base_v2",
    metadata={"hnsw:space": "cosine", "new_config": true}
)

# Migrate data
new_collection.add(
    documents=data['documents'],
    metadatas=data['metadatas'],
    ids=data['ids']
)
```

## Performance Considerations

### SQLite Optimization
- **Indexes**: Added on frequently queried columns
- **Connection Pooling**: TypeORM manages connections
- **Query Optimization**: Use proper indexes and LIMIT clauses
- **Backup**: Regular SQLite file backups

### ChromaDB Optimization
- **Batch Operations**: Add documents in batches
- **Index Tuning**: Adjust HNSW parameters for speed/accuracy tradeoff
- **Memory Management**: Monitor RAM usage for large document sets
- **Persistence**: Regular backups of chroma_db directory

## Data Integrity

### Constraints
- **Unique Constraints**: Email uniqueness in users table
- **Foreign Keys**: Document ID references in vector metadata
- **Not Null**: Required fields enforced at database level

### Validation
- **File Size**: Max 10MB per PDF
- **File Types**: Only PDF files allowed
- **Text Length**: Question/answer text limits
- **Session ID**: UUID format validation

## Backup Strategy

### SQLite Backup
```bash
# SQLite backup command
cp database.sqlite database.sqlite.backup

# Or using SQLite CLI
sqlite3 database.sqlite ".backup database.sqlite.backup"
```

### ChromaDB Backup
```bash
# Backup entire chroma_db directory
cp -r chroma_db chroma_db.backup
```

### Recovery Process
1. Stop all services
2. Restore backup files
3. Verify data integrity
4. Restart services
5. Test critical operations