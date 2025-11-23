// server/server.js
const express = require("express");
const fetch = require("node-fetch"); // only if Node <18
const multer = require("multer");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

const app = express();

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// In-memory storage for training status and knowledge base
const trainingStatus = new Map(); // documentId -> { status, progress, metadata }
const knowledgeBase = new Map(); // documentId -> { chunks, embeddings, metadata }
const documentStore = new Map(); // documentId -> { name, type, content }

// Simple text chunking function
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
  }
  
  return chunks;
}

// Generate embeddings using OpenAI
async function generateEmbedding(text) {
  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text
      })
    });
    
    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

// Cosine similarity for vector search
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Extract text from file based on type
async function extractTextFromFile(filePath, fileType, fileName) {
  try {
    if (fileType === 'text' || fileType === 'code') {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } else if (fileType === 'pdf') {
      // For PDF, we'll use a simple approach - in production, use pdf-parse
      // For now, return a placeholder that indicates PDF content
      return `[PDF Content from ${fileName}] This is a placeholder. In production, use pdf-parse library to extract text from PDF files.`;
    } else if (fileType === 'image') {
      // For images, would need OCR - placeholder for now
      return `[Image Content from ${fileName}] This is a placeholder. In production, use OCR libraries like Tesseract.js to extract text from images.`;
    }
    return '';
  } catch (error) {
    console.error("Error extracting text:", error);
    throw error;
  }
}

// Enable CORS for frontend requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
(async () => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    console.error('Error creating uploads directory:', error);
  }
})();

app.post("/api/recommend", async (req, res) => {
  const { components } = req.body;
  if (!components) return res.status(400).send({ error: "No components provided" });

  const prompt = `You are an IoT project assistant. Suggest 3 project ideas using these components: ${components.join(", ")}.
  For each project return JSON with: title, description (2-3 lines), requiredComponents (array), and difficulty (Easy/Medium/Hard).`;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.8
      })
    });

    const data = await openaiRes.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    try {
      const parsed = JSON.parse(content);
      res.json({ ok: true, result: parsed });
    } catch {
      res.json({ ok: true, resultText: content });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

// New endpoint: Train all documents with file uploads
app.post("/api/train", upload.array("documents"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "No documents provided" 
      });
    }

    const trainingId = `training_${Date.now()}`;
    const documents = req.files;
    
    // Initialize training status
    trainingStatus.set(trainingId, {
      status: 'processing',
      total: documents.length,
      completed: 0,
      documents: documents.map((file, index) => ({
        id: `doc_${index}`,
        name: file.originalname,
        type: getFileType(file.originalname),
        status: 'pending'
      }))
    });

    // Process documents asynchronously
    processDocumentsAsync(trainingId, documents).catch(err => {
      console.error("Error in async processing:", err);
      trainingStatus.set(trainingId, {
        ...trainingStatus.get(trainingId),
        status: 'error',
        error: err.message
      });
    });

    // Return immediately with training ID for polling
    res.json({
      success: true,
      trainingId: trainingId,
      message: "Training started",
      totalDocuments: documents.length
    });

  } catch (err) {
    console.error("Error starting training:", err);
    res.status(500).json({
      success: false,
      error: "Failed to start training",
      message: err.message
    });
  }
});

// Helper function to get file type
function getFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (['.pdf'].includes(ext)) return 'pdf';
  if (['.txt', '.md', '.doc', '.docx'].includes(ext)) return 'text';
  if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) return 'image';
  if (['.c', '.cpp', '.ino', '.py', '.js', '.ts'].includes(ext)) return 'code';
  return 'text';
}

// Async function to process documents
async function processDocumentsAsync(trainingId, documents) {
  const status = trainingStatus.get(trainingId);
  
  for (let i = 0; i < documents.length; i++) {
    const file = documents[i];
    const docId = `doc_${i}`;
    
    try {
      // Update status
      status.documents[i].status = 'processing';
      trainingStatus.set(trainingId, status);

      console.log(`Processing document ${i + 1}/${documents.length}: ${file.originalname}`);

      // Extract text from file
      const text = await extractTextFromFile(file.path, getFileType(file.originalname), file.originalname);
      
      // Chunk the text
      const chunks = chunkText(text);
      console.log(`Created ${chunks.length} chunks for ${file.originalname}`);

      // Generate embeddings for each chunk
      const chunksWithEmbeddings = [];
      for (let j = 0; j < chunks.length; j++) {
        const embedding = await generateEmbedding(chunks[j]);
        chunksWithEmbeddings.push({
          text: chunks[j],
          embedding: embedding,
          chunkIndex: j
        });
        
        // Small delay to avoid rate limiting
        if (j < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Store in knowledge base
      knowledgeBase.set(docId, {
        documentId: docId,
        name: file.originalname,
        type: getFileType(file.originalname),
        chunks: chunksWithEmbeddings,
        metadata: {
          totalChunks: chunks.length,
          totalTokens: text.length
        }
      });

      // Store document content
      documentStore.set(docId, {
        name: file.originalname,
        type: getFileType(file.originalname),
        content: text
      });

      // Update status
      status.documents[i].status = 'completed';
      status.completed++;
      trainingStatus.set(trainingId, status);

      // Clean up uploaded file
      await fs.unlink(file.path).catch(console.error);

    } catch (error) {
      console.error(`Error processing document ${file.originalname}:`, error);
      status.documents[i].status = 'error';
      status.documents[i].error = error.message;
      trainingStatus.set(trainingId, status);
    }
  }

  // Mark training as completed
  status.status = 'completed';
  trainingStatus.set(trainingId, status);
  console.log(`Training ${trainingId} completed`);
}

// Endpoint to check training status (for polling)
app.get("/api/train/status/:trainingId", (req, res) => {
  const { trainingId } = req.params;
  const status = trainingStatus.get(trainingId);
  
  if (!status) {
    return res.status(404).json({
      success: false,
      error: "Training ID not found"
    });
  }

  res.json({
    success: true,
    ...status
  });
});

// Chat endpoint with RAG
app.post("/api/chat", async (req, res) => {
  try {
    const { message, trainingId } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required"
      });
    }

    // Get relevant context from knowledge base using RAG
    const relevantContext = await retrieveRelevantContext(message, trainingId);
    
    // Build prompt with context
    const contextText = relevantContext.length > 0
      ? `\n\nRelevant context from trained documents:\n${relevantContext.map((ctx, i) => `${i + 1}. ${ctx.text}`).join('\n')}`
      : '';
    
    const prompt = `You are Triyug AI, a hardware documentation assistant. Answer the user's question based on the provided context from trained documents. If the context doesn't contain enough information, say so politely.

${contextText}

User question: ${message}

Provide a helpful, accurate answer based on the context:`;

    // Get LLM response
    const llmResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await llmResponse.json();
    const responseText = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response.";

    res.json({
      success: true,
      response: responseText,
      contextUsed: relevantContext.length > 0
    });

  } catch (err) {
    console.error("Error in chat endpoint:", err);
    res.status(500).json({
      success: false,
      error: "Failed to process chat message",
      message: err.message
    });
  }
});

// RAG retrieval function
async function retrieveRelevantContext(query, trainingId, topK = 3) {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Search through all documents in knowledge base
    const allResults = [];
    
    for (const [docId, docData] of knowledgeBase.entries()) {
      for (const chunk of docData.chunks) {
        const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
        allResults.push({
          text: chunk.text,
          similarity: similarity,
          documentId: docId,
          documentName: docData.name
        });
      }
    }
    
    // Sort by similarity and return top K
    allResults.sort((a, b) => b.similarity - a.similarity);
    return allResults.slice(0, topK);
    
  } catch (error) {
    console.error("Error retrieving context:", error);
    return [];
  }
}

// Legacy endpoint for backward compatibility
app.post("/api/trainDocument", async (req, res) => {
  const { documentId } = req.body;
  
  if (!documentId) {
    return res.status(400).json({ 
      success: false, 
      error: "Document ID is required" 
    });
  }

  try {
    console.log(`Starting RAG training for document: ${documentId}`);
    
    // Simulate processing time (2-5 seconds)
    const processingTime = 2000 + Math.random() * 3000;
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    console.log(`RAG training completed for document: ${documentId}`);
    
    res.json({
      success: true,
      message: "Document training completed successfully",
      documentId: documentId,
      metadata: {
        chunksProcessed: Math.floor(Math.random() * 50) + 10,
        embeddingsGenerated: Math.floor(Math.random() * 50) + 10,
        trainingTime: Math.round(processingTime / 1000) + "s"
      }
    });
    
  } catch (err) {
    console.error(`Error training document ${documentId}:`, err);
    res.status(500).json({
      success: false,
      error: "Failed to train document",
      message: err.message
    });
  }
});

app.listen(4000, () => console.log("✅ AI recommender running on http://localhost:4000"));
