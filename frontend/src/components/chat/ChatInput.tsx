import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { SendHorizonal } from "lucide-react";
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

  return (
    <div className="border-t border-surface-border bg-surface-base px-4 py-3">
      <div
        className={clsx(
          "flex items-end gap-2 rounded-xl border bg-surface-raised transition-all",
          disabled
            ? "border-surface-border opacity-50"
            : "border-surface-border focus-within:border-accent/50 focus-within:shadow-glow-sm"
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder={
            disabled
              ? "Analyze a repository to start chatting…"
              : "Ask anything about the codebase… (Enter to send, Shift+Enter for newline)"
          }
          className={clsx(
            "flex-1 bg-transparent resize-none px-3.5 py-3",
            "text-sm text-ink-primary placeholder:text-ink-tertiary",
            "focus:outline-none leading-relaxed",
            "min-h-[44px] max-h-[160px]"
          )}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className={clsx(
            "flex-shrink-0 m-2 p-1.5 rounded-lg transition-all",
            !value.trim() || disabled
              ? "text-ink-tertiary cursor-not-allowed"
              : "bg-accent hover:bg-accent-dim text-white shadow-glow-sm"
          )}
        >
          <SendHorizonal size={17} />
        </button>
      </div>
      <p className="mt-1.5 text-center text-2xs text-ink-tertiary">
        AI-generated. Verify important code details independently.
      </p>
    </div>
  );
}