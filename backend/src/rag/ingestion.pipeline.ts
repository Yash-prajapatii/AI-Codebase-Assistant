import { cloneRepository } from "../services/github.service.js";
import { parseRepository } from "../services/fileParser.service.js";
import { chunkFiles } from "../services/chunker.service.js";
import { indexChunks } from "../services/vectorStore.service.js";
import { createTempDir, removeTempDir } from "../utils/tempDir.js";
import { discoverRoutes } from "../tools/routeDiscovery.tool.js";
import { IngestionResult } from "../types/index.js";

export async function runIngestionPipeline(
  repoUrl: string,
  sessionId: string
): Promise<IngestionResult> {
  let tempDir: string | null = null;

  try {
    console.log(`[ingestion] Starting pipeline for ${repoUrl}`);

    // 1. Isolated temp directory per session
    tempDir = await createTempDir(sessionId);

    // 2. Shallow clone — depth 1, no history, no tags
    console.log(`[ingestion] Cloning ${repoUrl}`);
    const cloneResult = await cloneRepository(repoUrl, tempDir);

    // 3. Walk and parse all supported files
    console.log(`[ingestion] Parsing files`);
    const files = await parseRepository(tempDir, cloneResult.repoName);

    // 4. Language-aware chunking with overlap
    console.log(`[ingestion] Chunking ${files.length} files`);
    const chunks = await chunkFiles(files, sessionId, cloneResult.repoName);

    // 5. Embed and index into ChromaDB
    console.log(`[ingestion] Indexing ${chunks.length} chunks`);
    const collectionId = await indexChunks(chunks, sessionId);

    // 6. Agentic route discovery — reuses already-parsed files (no re-clone)
    console.log(`[ingestion] Running route discovery tool`);
    const routeMap = await discoverRoutes(files);
    console.log(`[ingestion] Discovered ${routeMap.length} API routes`);

    console.log(
      `[ingestion] Pipeline complete for ${cloneResult.repoName}`
    );

    return {
      repoName: cloneResult.repoName,
      owner: cloneResult.owner,
      defaultBranch: cloneResult.defaultBranch,
      fileCount: files.length,
      chunkCount: chunks.length,
      collectionId,
      routeMap,
    };
  } finally {
    // Always clean up cloned files from disk — even on error
    if (tempDir) await removeTempDir(tempDir);
  }
}