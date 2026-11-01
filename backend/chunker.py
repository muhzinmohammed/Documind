def chunk_text(
    text: str,
    chunk_size: int = 2000,
    overlap: int = 300,
) -> list[str]:

    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")

    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("Invalid overlap")

    text = " ".join(text.split())

    if not text:
        return []

    chunks = []
    start = 0

    while start < len(text):

        end = min(start + chunk_size, len(text))

        # Try to avoid cutting words in half.
        if end < len(text):
            boundary = text.rfind(" ", start, end)

            if boundary > start:
                end = boundary

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= len(text):
            break

        start = end - overlap

    return chunks

def chunk_pages(pages: list[dict]) -> list[dict]:

    all_chunks = []

    for page_data in pages:

        page_number = page_data["page"]
        text = page_data["text"]

        chunks = chunk_text(text)

        for chunk_index, chunk in enumerate(chunks):

            all_chunks.append({
                "text": chunk,
                "page": page_number,
                "chunk_index": chunk_index,
            })

    return all_chunks