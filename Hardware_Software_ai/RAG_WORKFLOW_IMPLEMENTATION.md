# RAG Workflow Implementation

## Overview

This document describes the complete RAG (Retrieval-Augmented Generation) workflow implementation for the Hardware/Software AI platform.

## Workflow Steps

### 1. Document Upload
- User uploads documents (PDF, text, images, code) via drag-and-drop or file browser
- Files are stored in component state with metadata
- Documents show "processing" status initially, then "completed" when ready

### 2. Training Initiation
- User clicks "Train All Documents" button
- Frontend collects all completed documents that haven't been trained
- Files are sent to backend `/api/train` endpoint as FormData

### 3. Backend Processing (Asynchronous)
The backend processes documents through a RAG pipeline:

#### a. File Upload & Storage
- Files received via `multer` middleware
- Stored temporarily in `uploads/` directory
- Training ID generated for tracking

#### b. Text Extraction
- Text files: Direct read
- Code files: Direct read
- PDF files: Placeholder (production: use `pdf-parse`)
- Images: Placeholder (production: use OCR like Tesseract.js)

#### c. Document Chunking
- Text split into chunks (1000 characters with 200 character overlap)
- Ensures context preservation across chunk boundaries

#### d. Embedding Generation
- Each chunk converted to vector embeddings using OpenAI's `text-embedding-3-small`
- Embeddings stored in-memory knowledge base
- Rate limiting handled with delays between requests

#### e. Vector Storage
- Embeddings stored with metadata (document ID, chunk index, text)
- In-memory Map structure (production: use Pinecone, Weaviate, Qdrant)

#### f. Status Tracking
- Training status tracked per document
- Overall training status maintained
- Progress updates available via polling endpoint

### 4. Training Status Polling
- Frontend polls `/api/train/status/:trainingId` every 2 seconds
- Updates progress bar and individual document statuses
- Stops polling when training completes or errors

### 5. Chat Panel Activation
- Triyug AI panel automatically opens when training completes
- Welcome message displayed
- Chat interface ready for questions

### 6. RAG-Powered Chat
When user sends a message:

#### a. Query Processing
- Message sent to `/api/chat` endpoint with `trainingId`
- Query converted to embedding using same model

#### b. Context Retrieval
- Cosine similarity search across all document chunks
- Top K (default: 3) most relevant chunks retrieved
- Context ranked by similarity score

#### c. LLM Response Generation
- Retrieved context prepended to user query
- Prompt sent to GPT-4o-mini with context
- Response generated based on trained documents

#### d. Response Display
- AI response displayed in chat interface
- Loading state shown during processing
- Error handling for failed requests

## Architecture

### Backend (`server/server.js`)

**Data Structures:**
- `trainingStatus`: Map of trainingId → status object
- `knowledgeBase`: Map of documentId → chunks with embeddings
- `documentStore`: Map of documentId → document metadata

**Key Functions:**
- `chunkText()`: Splits text into overlapping chunks
- `generateEmbedding()`: Creates embeddings via OpenAI API
- `cosineSimilarity()`: Calculates vector similarity
- `extractTextFromFile()`: Extracts text from various file types
- `retrieveRelevantContext()`: RAG retrieval using similarity search
- `processDocumentsAsync()`: Async document processing pipeline

**Endpoints:**
- `POST /api/train`: Upload and start training
- `GET /api/train/status/:trainingId`: Poll training status
- `POST /api/chat`: Chat with RAG context

### Frontend (`TrainLibraries.tsx`)

**State Management:**
- `uploadedFiles`: List of uploaded documents
- `fileObjects`: Map of fileId → File object (for sending to backend)
- `overallTrainingStatus`: Overall training state
- `trainingProgress`: Progress tracking
- `currentTrainingId`: ID for current training session
- `showTriyugAI`: Chat panel visibility
- `triyugMessages`: Chat message history

**Key Functions:**
- `handleFileUpload()`: Processes file uploads
- `handleTrainAll()`: Initiates training with file upload
- `pollTrainingStatus()`: Polls backend for training updates
- `handleTriyugSend()`: Sends chat messages to backend

## Data Flow

```
User Upload → Frontend State → Train Button Click
    ↓
FormData with Files → POST /api/train
    ↓
Backend: Extract Text → Chunk → Generate Embeddings → Store
    ↓
Frontend: Poll Status → Update UI → Training Complete
    ↓
Triyug AI Panel Opens → User Types Message
    ↓
POST /api/chat → Backend: RAG Retrieval → LLM Response
    ↓
Frontend: Display Response
```

## Production Enhancements

### Backend
1. **Vector Database**: Replace in-memory storage with Pinecone/Weaviate/Qdrant
2. **PDF Parsing**: Integrate `pdf-parse` library
3. **OCR**: Add Tesseract.js for image text extraction
4. **Persistence**: Store embeddings in database
5. **WebSockets**: Real-time training updates instead of polling
6. **Error Recovery**: Retry logic for failed embeddings
7. **Rate Limiting**: Prevent API abuse
8. **Authentication**: Secure endpoints

### Frontend
1. **File Validation**: Check file types and sizes before upload
2. **Progress Indicators**: More detailed progress for each document
3. **Error Messages**: User-friendly error handling
4. **Chat History**: Persist chat conversations
5. **Streaming Responses**: Show responses as they're generated
6. **Context Indicators**: Show which documents were used in response

## Environment Variables

```env
OPENAI_API_KEY=your-openai-api-key
```

## Dependencies

### Backend
- `express`: Web framework
- `multer`: File upload handling
- `node-fetch`: HTTP requests
- `dotenv`: Environment variables

### Frontend
- React hooks for state management
- Fetch API for HTTP requests

## Testing the Workflow

1. **Start Backend:**
   ```bash
   cd server
   npm install
   node server.js
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Test Flow:**
   - Upload a text file or PDF
   - Wait for processing to complete
   - Click "Train All Documents"
   - Watch training progress
   - Triyug AI panel opens automatically
   - Ask questions about the uploaded documents
   - Verify responses use document context

## Troubleshooting

### Training Fails
- Check OpenAI API key is set
- Verify files are valid and readable
- Check server logs for errors
- Ensure uploads directory exists

### Chat Not Working
- Verify training completed successfully
- Check `trainingId` is being sent with chat requests
- Verify OpenAI API key is valid
- Check network requests in browser console

### Slow Performance
- Reduce chunk size for faster processing
- Use faster embedding model
- Implement caching for embeddings
- Use production vector database

## Next Steps

1. Add PDF parsing library
2. Implement OCR for images
3. Set up vector database
4. Add authentication
5. Implement WebSockets for real-time updates
6. Add chat history persistence
7. Implement streaming responses
8. Add document management (delete, re-train)

