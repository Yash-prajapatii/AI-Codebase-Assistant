import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  GITHUB_TOKEN: z.string().optional(),
  CHROMA_URL: z.string().default("http://localhost:8000"),
  CHROMA_COLLECTION_PREFIX: z.string().default("repo_"),
  CHUNK_SIZE: z.coerce.number().default(1200),
  CHUNK_OVERLAP: z.coerce.number().default(200),
  RETRIEVER_TOP_K: z.coerce.number().default(8),
  MAX_CONTEXT_TOKENS: z.coerce.number().default(12000),
  CLONE_TIMEOUT_MS: z.coerce.number().default(60000),
  MAX_FILE_SIZE_BYTES: z.coerce.number().default(524288),
  MAX_REPO_FILES: z.coerce.number().default(500),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(20),

  // Gemini model used for chat completions.
  // Override in .env to switch models without a code change.
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),

  // Output dimensionality for gemini-embedding-001 (MRL scaling).
  // IMPORTANT: changing this requires deleting all ChromaDB collections
  // and re-indexing every repository.
  EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(768),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
export type Config = typeof config;