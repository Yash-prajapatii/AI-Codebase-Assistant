import {
  GoogleGenAI,
  HarmCategory,
  HarmBlockThreshold,
  type Content,
} from "@google/genai";
import { Response } from "express";
import { ChatMessage, RetrievedChunk } from "../types/index.js";
import { config } from "../config/index.js";

const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });

const MODEL = config.GEMINI_MODEL;
const MAX_OUTPUT_TOKENS = 4096;

// Retry configuration for transient Gemini API errors (503 Service Unavailable).
// Three attempts with exponential backoff: 1s → 2s → 4s.
// Only 503 is retried — 4xx errors are permanent and are re-thrown immediately.
const RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 1000;

const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

// ─── Retry helper ─────────────────────────────────────────────────────────────

function isRetryable(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    // Match SDK error messages for 503 Service Unavailable
    return msg.includes("503") || msg.includes("service unavailable") || msg.includes("overloaded");
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calls fn() up to RETRY_ATTEMPTS times, with exponential backoff between
 * attempts. Only retries on 503 / service-unavailable errors — all other
 * errors are re-thrown immediately on the first occurrence.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (!isRetryable(err)) throw err;

      lastError = err;
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.warn(
        `[gemini] ${label} — attempt ${attempt}/${RETRY_ATTEMPTS} failed (503). Retrying in ${delay}ms…`
      );
      await sleep(delay);
    }
  }

  throw lastError;
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

function buildSystemInstruction(
  repoName: string,
  sourceContext: string
): string {
  return `You are an expert software engineer analyzing the "${repoName}" codebase.

You have been given relevant source code chunks retrieved from the repository via semantic search. Use them to answer the user's question accurately and concisely.

RULES:
- Base your answers strictly on the provided code context. Do not invent code, APIs, or behaviour that is not present in the context.
- When referencing specific logic, always cite the file path in backticks: \`src/path/to/file.ts\`
- At the end of every answer, include a "**Referenced files:**" section listing every file path you drew from.
- Format code snippets using markdown fenced code blocks with the correct language identifier.
- If the retrieved context does not contain enough information to answer confidently, say so clearly rather than guessing.
- Keep answers technical and focused.

RETRIEVED CONTEXT:
${sourceContext}`;
}

function buildContextString(chunks: RetrievedChunk[]): string {
  return chunks
    .map(
      (chunk, i) =>
        `[${i + 1}] File: ${chunk.metadata.filePath} (lines ${
          chunk.metadata.startLine
        }–${chunk.metadata.endLine})\n\`\`\`${chunk.metadata.language}\n${
          chunk.content
        }\n\`\`\``
    )
    .join("\n\n---\n\n");
}

function buildContents(
  history: ChatMessage[],
  userMessage: string
): Content[] {
  const contents: Content[] = history.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  contents.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  return contents;
}

export function extractSourceFiles(chunks: RetrievedChunk[]): string[] {
  const seen = new Set<string>();
  return chunks
    .map((c) => c.metadata.filePath)
    .filter((fp) => {
      if (seen.has(fp)) return false;
      seen.add(fp);
      return true;
    });
}

// ─── Streaming chat response ──────────────────────────────────────────────────

export async function streamChatResponse(
  userMessage: string,
  chatHistory: ChatMessage[],
  retrievedChunks: RetrievedChunk[],
  repoName: string,
  res: Response
): Promise<string> {
  const systemInstruction = buildSystemInstruction(
    repoName,
    buildContextString(retrievedChunks)
  );

  const contents = buildContents(chatHistory, userMessage);

  // Acquire the stream with retry — no headers sent yet, safe to retry fully.
  // If all attempts fail, the error propagates to chat.controller.ts which
  // handles it correctly (headers not sent → next(err) → errorHandler).
  const stream = await withRetry(
    () =>
      ai.models.generateContentStream({
        model: MODEL,
        contents,
        config: {
          systemInstruction,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          safetySettings: SAFETY_SETTINGS,
        },
      }),
    "generateContentStream"
  );

  // Headers are set only after the stream is successfully acquired.
  // This ensures a 503 on the first attempt doesn't commit us to SSE.
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  let fullText = "";

  for await (const chunk of stream) {
    const token = chunk.text;
    if (token) {
      fullText += token;
      res.write(`data: ${JSON.stringify({ type: "token", token })}\n\n`);
    }
  }

  const sourceFiles = extractSourceFiles(retrievedChunks);
  res.write(`data: ${JSON.stringify({ type: "done", sourceFiles })}\n\n`);
  res.end();

  return fullText;
}