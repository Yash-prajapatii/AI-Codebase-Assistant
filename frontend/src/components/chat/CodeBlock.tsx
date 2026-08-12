import { useState } from "react";
import { Copy, Check } from "lucide-react";
import clsx from "clsx";

interface CodeBlockProps {
  children: string;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silently ignore
    }
  };

  // Strip the "language-" prefix to get a clean label (e.g. "typescript")
  const language = className?.replace(/^language-/, "") ?? "";

  return (
    <div className="group my-3.5 rounded-xl overflow-hidden border border-surface-border bg-surface-base">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-overlay border-b border-surface-border">
        {/* Language label — only shown when known */}
        {language ? (
          <span className="text-2xs font-mono text-ink-tertiary tracking-wide">
            {language}
          </span>
        ) : (
          <span aria-hidden="true" />
        )}

        {/* Copy button */}
        <button
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          className={clsx(
            "flex items-center gap-1.5 text-2xs font-medium px-2 py-1 rounded-md transition-all duration-150",
            copied
              ? "text-success bg-success/10"
              : "text-ink-tertiary hover:text-ink-secondary hover:bg-surface-hover"
          )}
        >
          {copied ? (
            <><Check size={11} aria-hidden="true" /> Copied</>
          ) : (
            <><Copy size={11} aria-hidden="true" /> Copy</>
          )}
        </button>
      </div>

      {/* Code content */}
      <pre className="overflow-x-auto px-4 py-3.5 text-sm leading-relaxed font-mono text-ink-primary scrollbar-thin scrollbar-thumb-surface-border">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}