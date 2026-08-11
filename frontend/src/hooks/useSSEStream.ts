import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { openChatStream } from "../services/api";
import { useChatStore } from "../stores/chatStore";
import { getSessionId } from "./useRepoAnalysis";
import type { SSEEvent } from "../types";

function parseSSELine(line: string): SSEEvent | null {
  if (!line.startsWith("data: ")) return null;
  try {
    return JSON.parse(line.slice(6)) as SSEEvent;
  } catch {
    return null;
  }
}

export function useSSEStream() {
  const { addMessage, appendToken, finalizeMessage, setStreaming } =
    useChatStore();

  const sendMessage = useCallback(
    async (message: string): Promise<void> => {
      const sessionId = getSessionId();

      // Add user bubble immediately
      addMessage({
        id:        uuidv4(),
        role:      "user",
        content:   message,
        timestamp: new Date().toISOString(),
      });

      // Placeholder assistant bubble — filled token by token
      const assistantId = uuidv4();
      addMessage({
        id:        assistantId,
        role:      "assistant",
        content:   "",
        streaming: true,
        timestamp: new Date().toISOString(),
      });

      setStreaming(true);

      try {
        const reader = await openChatStream(sessionId, message);
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? ""; // keep last partial line in buffer

          for (const line of lines) {
            const event = parseSSELine(line.trim());
            if (!event) continue;

            if (event.type === "token") {
              appendToken(assistantId, event.token);
            } else if (event.type === "done") {
              finalizeMessage(assistantId, event.sourceFiles);
            } else if (event.type === "error") {
              finalizeMessage(assistantId, []);
              throw new Error(event.message);
            }
          }
        }
      } finally {
        setStreaming(false);
      }
    },
    [addMessage, appendToken, finalizeMessage, setStreaming]
  );

  return { sendMessage };
}