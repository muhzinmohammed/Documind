from chunker import chunk_pages
from vector_store import add_chunks


def index_document(
    pages: list[dict],
    document_id: str,
    filename: str,
) -> int:

    chunks = chunk_pages(pages)

    if not chunks:
        raise ValueError(
            "No extractable text found in the document"
        )

    add_chunks(
        document_id=document_id,
        filename=filename,
        chunks=chunks,
    )

    return len(chunks)