import { ChromaClient, Collection } from "chromadb";
import { DocumentChunk, RetrievedChunk, ChunkMetadata } from "../types/index.js";
import { embedTexts, embedQuery } from "./embeddings.service.js";
import { config } from "../config/index.js";

function buildChromaClient(): ChromaClient {
  const url = new URL(config.CHROMA_URL);
  const ssl = url.protocol === "https:";
  const host = url.hostname;
  const port = url.port ? Number(url.port) : ssl ? 443 : 8000;

  const chroma = new ChromaClient({
    host,
    port,
    ssl,
    tenant: "default_tenant",
    database: "default_database",
  });

  const baseUrl = config.CHROMA_URL.replace(/\/$/, "");
  (chroma as any).apiClient.setConfig({ baseUrl });

  return chroma;
}

const chroma = buildChromaClient();

function buildCollectionName(sessionId: string): string {
  const safe = sessionId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
  return `${config.CHROMA_COLLECTION_PREFIX}${safe}`;
}

async function getOrCreateCollection(
  collectionName: string
): Promise<Collection> {
  // embeddingFunction: null tells chromadb 3.x we are supplying our own embeddings
  // and suppresses the DefaultEmbeddingFunction warning that appears when the
  // Chroma server returns { name: "default", type: "known" } in configuration_json.
  return chroma.getOrCreateCollection({
    name: collectionName,
    metadata: { "hnsw:space": "cosine" },
    embeddingFunction: null,
  });
}

export async function indexChunks(
  chunks: DocumentChunk[],
  sessionId: string
): Promise<string> {
  const collectionName = buildCollectionName(sessionId);
  const collection = await getOrCreateCollection(collectionName);

  const UPSERT_BATCH = 100;

  for (let i = 0; i < chunks.length; i += UPSERT_BATCH) {
    const batch = chunks.slice(i, i + UPSERT_BATCH);
    const embeddings = await embedTexts(batch.map((c) => c.content));

    await collection.upsert({
      ids: batch.map((c) => c.id),
      embeddings,
      documents: batch.map((c) => c.content),
      metadatas: batch.map(
        (c) => c.metadata as unknown as Record<string, string | number>
      ),
    });

    console.log(
      `[vectorStore] Indexed batch ${Math.floor(i / UPSERT_BATCH) + 1}/${Math.ceil(
        chunks.length / UPSERT_BATCH
      )}`
    );
  }

  console.log(
    `[vectorStore] Collection "${collectionName}" ready — ${chunks.length} chunks`
  );
  return collectionName;
}

export async function similaritySearch(
  query: string,
  collectionId: string,
  topK: number = config.RETRIEVER_TOP_K
): Promise<RetrievedChunk[]> {
  const collection = await chroma.getCollection({
    name: collectionId,
    embeddingFunction: undefined,
  });
  const queryEmbedding = await embedQuery(query);

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
    include: ["documents", "metadatas", "distances"] as any,
  });

  const docs = results.documents?.[0] ?? [];
  const metas = results.metadatas?.[0] ?? [];
  const distances = results.distances?.[0] ?? [];

  const chunks: RetrievedChunk[] = [];
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    const meta = metas[i];
    if (!doc || !meta) continue;
    chunks.push({
      content: doc,
      metadata: meta as unknown as ChunkMetadata,
      score: 1 - (distances[i] ?? 0),
    });
  }

  return chunks;
}

export async function deleteCollection(collectionId: string): Promise<void> {
  try {
    await chroma.deleteCollection({ name: collectionId });
  } catch (err) {
    console.warn(
      `[vectorStore] Could not delete collection ${collectionId}:`,
      err
    );
  }
}