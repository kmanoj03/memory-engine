// here the memory engine learns to understand meaning

// Eg: "TypeError: Cannot read property 'x' of undefined"
// → [0.002, 0.318, -0.051, ..., 0.924]

// That long vector of numbers captures context, meaning, and similarity between different errors.

// That’s what enables semantic search later using Atlas Vector Search.

// This interface Lets the compiler know the structure.
// Throws a clear error if Voyage changes their API shape

// res.json() returns unknown → we cast it explicitly with as VoyageEmbeddingResponse
// We still validate at runtime (if (!embedding || !Array.isArray(embedding))) in case the API ever changes.
// The compiler now knows embedding is a number[]
interface VoyageEmbeddingResponse {
  data: { embedding: number[] }[];
}

const EXPECTED_DIM = 1024; // voyage-3.5-lite

export async function generateIncidentEmbedding(
  text: string
): Promise<number[]> {
  const apiKey = process.env.VOYAGE_API_KEY!;
  const model = process.env.VOYAGE_MODEL ?? "voyage-3.5-lite";

  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, input: text }),
  });
  if (!res.ok) throw new Error(`Voyage error: ${res.status}`);

  const json = (await res.json()) as VoyageEmbeddingResponse;
  const emb = json?.data?.[0]?.embedding;
  if (!emb || !Array.isArray(emb)) throw new Error("Voyage: missing embedding");
  if (emb.length !== EXPECTED_DIM) {
    throw new Error(
      `Embedding dim ${emb.length} != EXPECTED_DIM ${EXPECTED_DIM}`
    );
  }
  return emb;
}
