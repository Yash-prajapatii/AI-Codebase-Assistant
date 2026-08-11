import { useCallback } from "react";
import { useSSEStream } from "./useSSEStream";
import { useChatStore } from "../stores/chatStore";
import { useRepoStore } from "../stores/repoStore";
import { useToast } from "../components/ui/Toast";

export function useChat() {
  const { sendMessage: streamMessage } = useSSEStream();
  const isStreaming = useChatStore((s) => s.isStreaming);
  const repoStatus  = useRepoStore((s) => s.status);
  const { addToast } = useToast();

  const sendMessage = useCallback(
    async (message: string) => {
      if (isStreaming) return;
      if (repoStatus !== "ready") {
        addToast("Analyze a repository first.", "warning");
        return;
      }
      try {
        await streamMessage(message);
      } catch (err) {
        addToast(
          err instanceof Error ? err.message : "Something went wrong.",
          "error"
        );
      }
    },
    [isStreaming, repoStatus, streamMessage, addToast]
  );

  return { sendMessage, isStreaming };
}