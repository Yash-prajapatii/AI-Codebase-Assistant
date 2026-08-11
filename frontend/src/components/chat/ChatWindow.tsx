import { useEffect, useRef } from "react";
import { MessageSquareCode, GitBranch } from "lucide-react";
import { useChatStore } from "../../stores/chatStore";
import { useRepoStore } from "../../stores/repoStore";
import { useChat } from "../../hooks/useChat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

export function ChatWindow() {
  const messages    = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const repoStatus  = useRepoStore((s) => s.status);
  const repoName    = useRepoStore((s) => s.repoName);
  const { sendMessage } = useChat();
  const bottomRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isReady     = repoStatus === "ready";
  const isAnalyzing = repoStatus === "analyzing";

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-border">
        {messages.length === 0 ? (
          <EmptyState
            repoName={repoName}
            isReady={isReady}
            isAnalyzing={isAnalyzing}
          />
        ) : (
          <div className="pb-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <ChatInput
        onSend={sendMessage}
        disabled={!isReady}
        isStreaming={isStreaming}
      />
    </div>
  );
}

function EmptyState({
  repoName,
  isReady,
  isAnalyzing,
}: {
  repoName: string;
  isReady: boolean;
  isAnalyzing: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8 py-16">
      <div className="w-14 h-14 rounded-2xl bg-surface-overlay border border-surface-border flex items-center justify-center">
        <MessageSquareCode size={24} className="text-accent/60" />
      </div>
      {isReady ? (
        <div>
          <p className="text-sm font-medium text-ink-primary flex items-center gap-1.5 justify-center">
            <GitBranch size={14} className="text-accent" />
            {repoName} is ready
          </p>
          <p className="text-sm text-ink-secondary mt-1">
            Ask anything about the codebase, or use a quick action in the sidebar.
          </p>
        </div>
      ) : isAnalyzing ? (
        <p className="text-sm text-ink-secondary">
          Indexing repository — this will take a moment.
        </p>
      ) : (
        <>
          <p className="text-sm font-medium text-ink-primary">
            No repository analyzed yet
          </p>
          <p className="text-sm text-ink-secondary">
            Paste a GitHub URL in the sidebar to get started.
          </p>
        </>
      )}
    </div>
  );
}