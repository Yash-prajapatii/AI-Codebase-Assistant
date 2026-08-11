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
        "flex gap-3 px-4 py-4 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={clsx(
          "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5",
          isUser
            ? "bg-accent/20 text-accent-glow"
            : "bg-surface-overlay text-ink-secondary border border-surface-border"
        )}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      <div
        className={clsx(
          "max-w-[82%] min-w-0",
          isUser ? "items-end" : "items-start"
        )}
      >
        {isUser ? (
          <div className="bg-accent/15 border border-accent/20 rounded-xl rounded-tr-sm px-3.5 py-2.5 text-sm text-ink-primary leading-relaxed">
            {message.content}
          </div>
        ) : (
          <div className="rounded-xl rounded-tl-sm px-3.5 py-3 bg-surface-raised border border-surface-border">
            {message.content === "" && message.streaming ? (
              <span className="inline-block w-[2px] h-4 bg-accent animate-blink" />
            ) : (
              <StreamingText
                content={message.content}
                streaming={message.streaming}
              />
            )}
            {!message.streaming && message.sourceFiles && (
              <SourceCitations files={message.sourceFiles} />
            )}
          </div>
        )}
        <p className="mt-1 text-2xs text-ink-tertiary px-1">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour:   "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}