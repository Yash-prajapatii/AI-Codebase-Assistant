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
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const language = className?.replace(/^language-/, "") ?? "";

  return (
    <div className="group relative my-3 rounded-lg overflow-hidden border border-surface-border bg-surface-base">
      <div className="flex items-center justify-between px-4 py-1.5 bg-surface-overlay border-b border-surface-border">
        <span className="text-2xs font-mono text-ink-tertiary tracking-wide">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className={clsx(
            "flex items-center gap-1 text-2xs transition-colors px-1.5 py-0.5 rounded",
            copied
              ? "text-success"
              : "text-ink-tertiary hover:text-ink-secondary hover:bg-surface-hover"
          )}
        >
          {copied ? (
            <><Check size={11} /> Copied</>
          ) : (
            <><Copy size={11} /> Copy</>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-sm leading-relaxed font-mono text-ink-primary">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}