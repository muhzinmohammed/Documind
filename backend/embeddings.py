from sentence_transformers import SentenceTransformer

model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)


def generate_embeddings(
    texts: list[str],
) -> list[list[float]]:

    vectors = model.encode(
        texts,
        normalize_embeddings=True,
    )

    return vectors.tolist()