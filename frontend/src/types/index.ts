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
  
  export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  
  export interface RouteEntry {
    method: HttpMethod;
    path: string;
    file: string;
    line: number;
  }
  
  export interface RepoState {
    status: "idle" | "analyzing" | "ready" | "error";
    repoUrl: string;
    repoName: string;
    owner: string;
    fileCount: number;
    chunkCount: number;
    error: string | null;
    routeMap: RouteEntry[];
  }
  
  // ─── Chat ─────────────────────────────────────────────────────────────────────
  
  export type MessageRole = "user" | "assistant";
  
  export interface ChatMessage {
    id: string;
    role: MessageRole;
    content: string;
    sourceFiles?: string[];
    timestamp: string;
    streaming?: boolean;
  }
  
  export interface SSETokenEvent { type: "token"; token: string; }
  export interface SSEDoneEvent  { type: "done";  sourceFiles: string[]; }
  export interface SSEErrorEvent { type: "error"; message: string; }
  export type SSEEvent = SSETokenEvent | SSEDoneEvent | SSEErrorEvent;
  
  // ─── Quick Actions ────────────────────────────────────────────────────────────
  
  export interface QuickAction {
    id: string;
    label: string;
    prompt: string;
    icon: string;
  }
  
  // ─── API ──────────────────────────────────────────────────────────────────────
  
  export interface ApiError {
    error: string;
    code: string;
    details?: Record<string, string[]>;
  }