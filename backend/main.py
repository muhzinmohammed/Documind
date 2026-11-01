from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from ollama import chat
from pathlib import Path
from pdf_processor import extract_pdf
from uuid import uuid4
from ingestion import index_document
from rag import answer_question
from fastapi import HTTPException
from pydantic import BaseModel



UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
      "http://localhost:5173",
      "http://127.0.0.1:5173"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str
    document_id: str

@app.get("/")
def home():
    return {"message": "Chat with PDFs API is running"}


@app.post("/chat")
def chat_endpoint(request: ChatRequest):

    print(request.question)
    print(request.document_id)
    
    res = answer_question(
      question = request.question,
      document_id = request.document_id
    )

    return res


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    try:

        print("Uploaded:", file.filename)

        result = await extract_pdf(file)

        document_id = str(uuid4())
        chunk_count = index_document(
          pages = result["pages"],
          document_id = document_id,
          filename = result["filename"]
        )

        return {
            "message": "PDF indexed successfully",
            "document_id": document_id,
            "filename": file.filename,
            "chunks_indexed": chunk_count,
        }

    except Exception as e:

        print("Upload error:", str(e))

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )