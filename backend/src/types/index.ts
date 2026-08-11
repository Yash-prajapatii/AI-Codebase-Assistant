// ─── Repository ───────────────────────────────────────────────────────────────

export interface RepoAnalyzeRequest {
    repoUrl: string;
    sessionId: string;
  }
  
  export interface RepoAnalyzeResponse {
    sessionId: string;
    repoName: string;
    owner: string;
    defaultBranch: string;
    fileCount: number;
    chunkCount: number;
    collectionId: string;
    analyzedAt: string;
  }
  
  export interface CloneResult {
    localPath: string;
    repoName: string;
    owner: string;
    defaultBranch: string;
    clonedAt: Date;
  }
  
  export interface ParsedFile {
    filePath: string;
    absolutePath: string;
    content: string;
    extension: string;
    sizeBytes: number;
    language: string;
  }
  
  // ─── Chunking ─────────────────────────────────────────────────────────────────
  
  export interface DocumentChunk {
    id: string;
    content: string;
    metadata: ChunkMetadata;
  }
  
  export interface ChunkMetadata {
    filePath: string;
    language: string;
    chunkIndex: number;
    totalChunks: number;
    startLine: number;
    endLine: number;
    repoName: string;
    sessionId: string;
  }
  
  // ─── Retrieval ────────────────────────────────────────────────────────────────
  
  export interface RetrievedChunk {
    content: string;
    metadata: ChunkMetadata;
    score: number;
  }
  
  export interface RetrievalResult {
    chunks: RetrievedChunk[];
    sourceFiles: string[];
  }
  
  // ─── Route Discovery ──────────────────────────────────────────────────────────
  
  export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  
  export interface RouteEntry {
    method: HttpMethod;
    path: string;
    file: string;
    line: number;
  }
  
  // ─── Chat ─────────────────────────────────────────────────────────────────────
  
  export interface ChatRequest {
    sessionId: string;
    message: string;
  }
  
  export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    sourceFiles?: string[];
    timestamp: string;
  }
  
  export interface ChatHistoryResponse {
    sessionId: string;
    messages: ChatMessage[];
  }
  
  // ─── Session Store ────────────────────────────────────────────────────────────
  
  export interface SessionData {
    sessionId: string;
    repoName: string;
    owner: string;
    collectionId: string;
    fileCount: number;
    chunkCount: number;
    analyzedAt: Date;
    messages: ChatMessage[];
    routeMap: RouteEntry[];
  }
  
  // ─── Errors ───────────────────────────────────────────────────────────────────
  
  export class AppError extends Error {
    constructor(
      public readonly message: string,
      public readonly statusCode: number,
      public readonly code: string
    ) {
      super(message);
      this.name = "AppError";
    }
  }
  
  export class CloneTimeoutError extends AppError {
    constructor(repoUrl: string) {
      super(
        `Clone timed out for repository: ${repoUrl}`,
        408,
        "CLONE_TIMEOUT"
      );
    }
  }
  
  export class NoSupportedFilesError extends AppError {
    constructor(repoName: string) {
      super(
        `Repository "${repoName}" contains no supported source files`,
        422,
        "NO_SUPPORTED_FILES"
      );
    }
  }
  
  export class SessionNotFoundError extends AppError {
    constructor(sessionId: string) {
      super(`Session not found: ${sessionId}`, 404, "SESSION_NOT_FOUND");
    }
  }
  
  export class InvalidRepoUrlError extends AppError {
    constructor(url: string) {
      super(`Invalid GitHub repository URL: ${url}`, 400, "INVALID_REPO_URL");
    }
  }
  
  // ─── RAG pipeline ─────────────────────────────────────────────────────────────
  
  export interface IngestionResult {
    repoName: string;
    owner: string;
    defaultBranch: string;
    fileCount: number;
    chunkCount: number;
    collectionId: string;
    routeMap: RouteEntry[];
  }
  
  export interface RetrievalPipelineInput {
    query: string;
    collectionId: string;
    sessionId: string;
    chatHistory: ChatMessage[];
  }
  
  export interface RetrievalPipelineResult {
    answer: string;
    sourceFiles: string[];
  }