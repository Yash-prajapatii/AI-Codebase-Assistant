import { GoogleGenAI } from "@google/genai";
import { config } from "../config/index.js";

// ─── Model ────────────────────────────────────────────────────────────────────
//
// gemini-embedding-001 is the current stable embedding model (GA July 2025).
// text-embedding-004 was shut down January 14, 2026 and must not be used.
//
// Dimensions: default is 3072, but MRL allows downscaling.
// We use 768 to match the previous model's dimension, keeping ChromaDB
// collections compatible and reducing storage cost with negligible accuracy
// loss at this project's scale.
//
// IMPORTANT: if you change EMBEDDING_DIMENSIONS, you must delete all existing
// ChromaDB collections and re-index every repository. Collections are locked
// to the dimension set at creation time.

const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });

const EMBEDDING_MODEL = "gemini-embedding-001";

// Read from validated config — guaranteed to be a positive integer.
const EMBEDDING_DIMENSIONS = config.EMBEDDING_DIMENSIONS;

// Free tier: 100 requests/min for embedContent.
// Each embedContent call counts as ONE request regardless of batch size,
// so batching is critical for staying within rate limits.
const BATCH_SIZE = 100;

// ─── Document embedding (indexing phase) ──────────────────────────────────────

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const result = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: batch,
      config: {
        taskType: "RETRIEVAL_DOCUMENT",
        outputDimensionality: EMBEDDING_DIMENSIONS,
      },
    });

    if (!result.embeddings) {
      throw new Error(
        `[embeddings] No embeddings returned for batch ${Math.floor(i / BATCH_SIZE) + 1}`
      );
    }

    allEmbeddings.push(...result.embeddings.map((e) => e.values ?? []));

    console.log(
      `[embeddings] Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
        texts.length / BATCH_SIZE
      )} — ${batch.length} texts embedded`
    );
  }

  return allEmbeddings;
}

// ─── Query embedding (retrieval phase) ────────────────────────────────────────

export async function embedQuery(query: string): Promise<number[]> {
  const result = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: query,
    config: {
      taskType: "RETRIEVAL_QUERY",
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  const values = result.embeddings?.[0]?.values;
  if (!values) {
    throw new Error("[embeddings] No embedding returned for query");
  }

  return values;
}