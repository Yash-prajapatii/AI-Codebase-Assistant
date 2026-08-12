import clsx from "clsx";
import { Bot, User } from "lucide-react";
import { StreamingText } from "./StreamingText";
import { SourceCitations } from "../citations/SourceCitations";
import type { ChatMessage as ChatMessageType } from "../../types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={clsx(
        "flex gap-3 px-5 py-3.5 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={clsx(
          "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5",
          isUser
            ? "bg-accent/20 text-accent-glow"
            : "bg-surface-overlay text-ink-tertiary border border-surface-border"
        )}
        aria-hidden="true"
      >
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>

      {/* Bubble + metadata */}
      <div
        className={clsx(
          "flex flex-col gap-1 max-w-[80%] min-w-0",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Role label */}
        <span className="text-2xs text-ink-tertiary font-medium px-0.5">
          {isUser ? "You" : "Assistant"}
        </span>

        {/* Message bubble */}
        {isUser ? (
          <div className="bg-accent/12 border border-accent/20 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-ink-primary leading-relaxed">
            {message.content}
          </div>
        ) : (
          <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-surface-raised border border-surface-border min-w-0 w-full">
            {/* Thinking indicator — empty content while streaming */}
            {message.content === "" && message.streaming ? (
              <div className="flex items-center gap-1.5 py-0.5" aria-label="Thinking">
                <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse" style={{ animationDelay: "300ms" }} />
              </div>
            ) : (
              <StreamingText
                content={message.content}
                streaming={message.streaming}
              />
            )}

            {/* Source citations — only after stream completes */}
            {!message.streaming && message.sourceFiles && message.sourceFiles.length > 0 && (
              <SourceCitations files={message.sourceFiles} />
            )}
          </div>
        )}

        {/* Timestamp */}
        <time
          dateTime={message.timestamp}
          className="text-2xs text-ink-tertiary/60 px-0.5"
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
    </div>
  );
}