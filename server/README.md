# RAG Training Server

This server implements a complete RAG (Retrieval-Augmented Generation) workflow for training documents and providing AI chat assistance.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the server directory:
```env
OPENAI_API_KEY=your-openai-api-key-here
```

3. Start the server:
```bash
node server.js
```

The server will run on `http://localhost:4000`

## Endpoints

### POST /api/train
Upload and train documents for RAG.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with `documents` field (array of files)

**Response:**
```json
{
  "success": true,
  "trainingId": "training_1234567890",
  "message": "Training started",
  "totalDocuments": 3
}
```

### GET /api/train/status/:trainingId
Check training status (for polling).

**Response:**
```json
{
  "success": true,
  "status": "processing" | "completed" | "error",
  "total": 3,
  "completed": 2,
  "documents": [
    {
      "id": "doc_0",
      "name": "document.pdf",
      "type": "pdf",
      "status": "completed"
    }
  ]
}
```

### POST /api/chat
Chat with AI using trained documents as context.

**Request:**
```json
{
  "message": "What are the GPIO pins on ESP32?",
  "trainingId": "training_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Based on the trained documentation...",
  "contextUsed": true
}
```

## How It Works

1. **Document Upload**: Files are uploaded via `/api/train`
2. **Text Extraction**: Text is extracted from files (PDF, text, code, images)
3. **Chunking**: Documents are split into smaller chunks (1000 chars with 200 char overlap)
4. **Embedding Generation**: Each chunk is converted to embeddings using OpenAI's `text-embedding-3-small` model
5. **Vector Storage**: Embeddings are stored in-memory (in production, use Pinecone, Weaviate, etc.)
6. **RAG Retrieval**: When chatting, relevant chunks are retrieved using cosine similarity
7. **LLM Response**: Retrieved context is sent to GPT-4o-mini along with the user's question

## Production Considerations

- Replace in-memory storage with a proper vector database (Pinecone, Weaviate, Qdrant)
- Add persistent storage for documents and embeddings
- Implement proper PDF parsing (use `pdf-parse` library)
- Add OCR for images (use Tesseract.js)
- Add rate limiting
- Add authentication
- Use WebSockets or Server-Sent Events for real-time training updates
- Add error recovery and retry logic
- Implement document versioning

## File Structure

```
server/
├── server.js          # Main server file
├── package.json       # Dependencies
├── .env              # Environment variables (create this)
└── uploads/          # Temporary file storage (auto-created)
```

