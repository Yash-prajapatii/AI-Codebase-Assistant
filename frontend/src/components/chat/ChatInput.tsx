import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { SendHorizonal, Square } from "lucide-react";
import clsx from "clsx";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
}

export function ChatInput({ onSend, disabled, isStreaming }: ChatInputProps) {
  const [value, setValue]  = useState("");
  const textareaRef        = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend     = !!value.trim() && !disabled && !isStreaming;
  const inputActive = !disabled;

  return (
    <div className="border-t border-surface-border bg-surface-base px-4 py-3 flex-shrink-0">
      <div
        className={clsx(
          "flex items-end gap-2 rounded-xl border bg-surface-raised transition-all duration-150",
          !inputActive
            ? "border-surface-border opacity-50"
            : isStreaming
            ? "border-surface-border"
            : "border-surface-border focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/15"
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isStreaming}
          rows={1}
          aria-label="Message input"
          placeholder={
            disabled
              ? "Analyze a repository to start chatting…"
              : isStreaming
              ? "Waiting for response…"
              : "Ask anything about the codebase…"
          }
          className={clsx(
            "flex-1 bg-transparent resize-none px-3.5 py-3",
            "text-sm text-ink-primary placeholder:text-ink-tertiary",
            "focus:outline-none leading-relaxed",
            "min-h-[44px] max-h-[160px]",
            (disabled || isStreaming) && "cursor-not-allowed"
          )}
        />

        {/* Send / streaming state button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          aria-label={isStreaming ? "Waiting for response" : "Send message"}
          className={clsx(
            "flex-shrink-0 m-2 p-1.5 rounded-lg transition-all duration-150",
            isStreaming
              ? "text-ink-tertiary cursor-not-allowed"
              : canSend
              ? "bg-accent hover:bg-accent-dim text-white"
              : "text-ink-tertiary cursor-not-allowed"
          )}
        >
          {isStreaming ? (
            <Square size={15} className="fill-current" aria-hidden="true" />
          ) : (
            <SendHorizonal size={16} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between mt-1.5 px-0.5">
        <p className="text-2xs text-ink-tertiary/70">
          AI-generated.
        </p>
        {!disabled && !isStreaming && (
          <p className="text-2xs text-ink-tertiary/50 font-mono">
            ↵ send
          </p>
        )}
      </div>
    </div>
  );
}