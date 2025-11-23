import os
import glob
import shutil
import uuid

from fastapi import FastAPI, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import faiss
import requests

from sentence_transformers import SentenceTransformer
import PyPDF2

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI()

# CORS - allow frontend on localhost:5173 to access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = SentenceTransformer('all-MiniLM-L6-v2')
vector_index = None
docs_list = []

# --------- File Upload Endpoint ----------
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    save_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "status": "uploaded"}

# --------- Training Endpoint ----------
@app.post("/api/train")
async def train():
    """
    Index all uploaded documents for retrieval.
    Returns a training ID to poll status if needed.
    """
    global vector_index, docs_list
    training_id = "local-training-id"

    # Index documents now!
    docs, chunks = [], []
    files = glob.glob(os.path.join(UPLOAD_DIR, "*"))
    for path in files:
        ext = os.path.splitext(path)[-1].lower()
        if ext == ".pdf":
            text = extract_pdf_text(path)
        elif ext in {".txt", ".md"}:
            with open(path, "r", encoding="utf-8") as f:
                text = f.read()
        else:
            continue
        these_chunks = chunk_text(text)
        chunks.extend(these_chunks)
        docs.extend([os.path.basename(path)] * len(these_chunks))
    if chunks:
        embs = model.encode(chunks)
        idx = faiss.IndexFlatL2(embs.shape[1])
        idx.add(np.array(embs, dtype='float32'))
        vector_index = idx
        docs_list.clear()
        docs_list.extend(chunks)
    else:
        vector_index = None
        docs_list.clear()
    return {"success": True, "trainingId": training_id}

# --------- Training Status Endpoint ----------
@app.get("/api/train/status/{training_id}")
async def train_status(training_id: str):
    # Dummy implementation for UI progress
    chunks = len(docs_list)
    return {
        "success": True,
        "status": "completed",
        "total": chunks,
        "completed": chunks,
        "documents": [
            {"name": f"doc-{i+1}", "status": "completed"} for i in range(chunks)
        ]
    }

# --------- Chat Endpoint ----------
class ChatRequest(BaseModel):
    query: str

@app.post("/api/chat")
def chat(req: ChatRequest):
    global vector_index, docs_list
    query = req.query
    print(f"Received query: {query}")

    if vector_index is None or not docs_list:
        return {"success": False, "response": "Knowledge base empty. Upload and train documents first."}

    q_emb = model.encode([query]).astype('float32')
    D, I = vector_index.search(q_emb, 1)  # Use 1-2 docs to keep prompt small!
    context = "\n---\n".join([docs_list[i] for i in I[0]])
    prompt = (
        f"You are an expert hardware documentation AI. Answer user questions with context below. "
        f"If you can't answer from the context, say so.\n\n"
        f"CONTEXT:\n{context}\n\n"
        f"USER QUESTION: {query}\n\n"
        f"ANSWER:"
    )

    print(f"Prompt to Ollama (length={len(prompt)}):\n{prompt[:1000]}...")

    answer = ollama_generate(prompt, model="llama2")
    print(f"Ollama reply: {answer[:500]}")
    return {"success": True, "response": answer}

# --------- Utilities ----------
def extract_pdf_text(pdf_path):
    # Extract plain text from PDF
    try:
        with open(pdf_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""

def chunk_text(text, chunk_size=256, overlap=30):
    # Smart chunking for RAG context
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = words[i:i+chunk_size]
        chunks.append(" ".join(chunk))
        i += chunk_size - overlap
    return [c for c in chunks if len(c.strip()) > 0]

def ollama_generate(prompt, model="llama2"):
    try:
        resp = requests.post(
            "http://localhost:11434/api/generate",
            json={"model": model, "prompt": prompt, "stream": False},
            timeout=60
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("response") or "No response from LLM"
    except Exception as e:
        return f"[LLM generation failed: {e}]"

# --------- MAIN ----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", port=8000, reload=True)
