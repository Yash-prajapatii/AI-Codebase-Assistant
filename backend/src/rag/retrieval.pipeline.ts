import { Response } from "express";
import { similaritySearch } from "../services/vectorStore.service.js";
import {
  streamChatResponse,
  extractSourceFiles,
} from "../services/gemini.service.js";
import { RetrievalPipelineInput } from "../types/index.js";
import { config } from "../config/index.js";

export async function runRetrievalPipeline(
  input: RetrievalPipelineInput,
  repoName: string,
  res: Response
): Promise<{ fullText: string; sourceFiles: string[] }> {
  const { query, collectionId, chatHistory } = input;

  console.log(
    `[retrieval] Query: "${query.slice(0, 80)}..." | collection: ${collectionId}`
  );

  // 1. Embed query and retrieve top-k semantically similar chunks
  const chunks = await similaritySearch(
    query,
    collectionId,
    config.RETRIEVER_TOP_K
  );
  console.log(`[retrieval] Retrieved ${chunks.length} chunks`);

  // 2. Stream Gemini response with injected context into SSE connection
  const fullText = await streamChatResponse(
    query,
    chatHistory,
    chunks,
    repoName,
    res
  );

  const sourceFiles = extractSourceFiles(chunks);
  return { fullText, sourceFiles };
}