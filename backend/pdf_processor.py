from fastapi import UploadFile, File, HTTPException
from pathlib import Path
import pymupdf

async def extract_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF file",
        )

    contents = await file.read()

    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="PDF must be 10 MB or smaller",
        )

    try:
        with pymupdf.open(
            stream=contents,
            filetype="pdf",
        ) as document:
            pages = [
                {
                    "page": index + 1,
                    "text": page.get_text(),
                }
                for index, page in enumerate(document)
            ]
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Unable to read this PDF",
        )

    if not any(page["text"].strip() for page in pages):
        raise HTTPException(
            status_code=400,
            detail="No extractable text found in this PDF",
        )

    return {
        "filename": file.filename,
        "pages": pages,
    }