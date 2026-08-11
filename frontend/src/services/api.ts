import type {
    RepoAnalyzeRequest,
    RepoAnalyzeResponse,
    ChatMessage,
    RouteEntry,
    ApiError,
  } from "../types";
  
  const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";
  
  async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      const err: ApiError = await res
        .json()
        .catch(() => ({ error: `HTTP ${res.status}`, code: "UNKNOWN" }));
      throw new Error(err.error ?? "Request failed");
    }
    return res.json() as Promise<T>;
  }
  
  export async function analyzeRepository(
    payload: RepoAnalyzeRequest
  ): Promise<RepoAnalyzeResponse> {
    const res = await fetch(`${BASE_URL}/repo/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<RepoAnalyzeResponse>(res);
  }
  
  export async function fetchRouteMap(
    sessionId: string
  ): Promise<RouteEntry[]> {
    const res = await fetch(
      `${BASE_URL}/repo/routes?sessionId=${encodeURIComponent(sessionId)}`
    );
    const data = await handleResponse<{
      sessionId: string;
      routeMap: RouteEntry[];
    }>(res);
    return data.routeMap;
  }
  
  export async function getChatHistory(
    sessionId: string
  ): Promise<ChatMessage[]> {
    const res = await fetch(`${BASE_URL}/chat/history/${sessionId}`);
    const data = await handleResponse<{
      sessionId: string;
      messages: ChatMessage[];
    }>(res);
    return data.messages;
  }
  
  /**
   * Opens a POST /chat request and returns the raw ReadableStream reader.
   * The caller reads SSE events from the stream byte-by-byte.
   */
  export async function openChatStream(
    sessionId: string,
    message: string
  ): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message }),
    });
  
    if (!res.ok) {
      const err: ApiError = await res
        .json()
        .catch(() => ({ error: `HTTP ${res.status}`, code: "UNKNOWN" }));
      throw new Error(err.error ?? "Chat request failed");
    }
  
    if (!res.body) throw new Error("No response body");
    return res.body.getReader();
  }