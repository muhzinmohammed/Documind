import chromadb

from embeddings import generate_embeddings

client = chromadb.PersistentClient(
    path="./chroma_db"
)

collection = client.get_or_create_collection(
    name="pdf_chunks",
    metadata={"hnsw:space": "cosine"},
)

def add_chunks(
    document_id: str,
    filename: str,
    chunks: list[dict],
):

    if not chunks:
        return

    texts = [
        chunk["text"]
        for chunk in chunks
    ]

    embeddings = generate_embeddings(texts)

    ids = [
        f"{document_id}_chunk_{i}"
        for i in range(len(chunks))
    ]

    metadatas = [
        {
            "document_id": document_id,
            "filename": filename,
            "page": chunk["page"],
            "chunk_index": chunk["chunk_index"],
        }
        for chunk in chunks
    ]

    collection.upsert(
        ids=ids,
        documents=texts,
        embeddings=embeddings,
        metadatas=metadatas,
    )

def search_chunks(
    question: str,
    document_id: str,
    n_results: int = 4,
) -> list[dict]:

    question_embedding = generate_embeddings(
        [question]
    )[0]

    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=n_results,
        where={
            "document_id": document_id,
        },
        include=[
            "documents",
            "metadatas",
            "distances",
        ],
    )

    retrieved_chunks = []

    if not results["documents"]:
        return retrieved_chunks

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    for text, metadata, distance in zip(
        documents,
        metadatas,
        distances,
    ):

        retrieved_chunks.append({
            "text": text,
            "filename": metadata["filename"],
            "page": metadata["page"],
            "distance": distance,
        })

    return retrieved_chunks