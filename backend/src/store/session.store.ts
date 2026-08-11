import { SessionData, SessionNotFoundError, RouteEntry } from "../types/index.js";

class SessionStore {
  private sessions = new Map<string, SessionData>();

  create(data: SessionData): void {
    this.sessions.set(data.sessionId, data);
  }

  get(sessionId: string): SessionData {
    const session = this.sessions.get(sessionId);
    if (!session) throw new SessionNotFoundError(sessionId);
    return session;
  }

  has(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  update(sessionId: string, patch: Partial<SessionData>): void {
    const session = this.get(sessionId);
    this.sessions.set(sessionId, { ...session, ...patch });
  }

  delete(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  appendMessage(
    sessionId: string,
    message: SessionData["messages"][number]
  ): void {
    const session = this.get(sessionId);
    session.messages.push(message);
  }

  getMessages(sessionId: string): SessionData["messages"] {
    return this.get(sessionId).messages;
  }

  /**
   * Prune oldest messages to keep context window manageable.
   * Keeps the most recent maxMessages messages.
   */
  pruneHistory(sessionId: string, maxMessages = 20): void {
    const session = this.get(sessionId);
    if (session.messages.length > maxMessages) {
      session.messages = session.messages.slice(-maxMessages);
    }
  }

  getRouteMap(sessionId: string): RouteEntry[] {
    return this.get(sessionId).routeMap;
  }

  list(): SessionData[] {
    return Array.from(this.sessions.values());
  }
}

// Singleton — one store shared across the entire Express process lifetime
export const sessionStore = new SessionStore();