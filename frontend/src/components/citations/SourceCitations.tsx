import { useState } from "react";
import { FileCode2, ChevronDown, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface SourceCitationsProps {
  files: string[];
}

export function SourceCitations({ files }: SourceCitationsProps) {
  // Open by default — source files are the most valuable part of the response.
  // Users can collapse if they don't need them.
  const [open, setOpen] = useState(true);

  if (files.length === 0) return null;

  return (
    <div className="mt-3.5 pt-3 border-t border-surface-border/60">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={clsx(
          "flex items-center gap-2 w-full text-left",
          "text-2xs font-medium text-ink-tertiary",
          "hover:text-ink-secondary transition-colors duration-100",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 rounded"
        )}
      >
        <FileCode2 size={11} className="flex-shrink-0" aria-hidden="true" />
        <span>
          {files.length} source file{files.length !== 1 ? "s" : ""} referenced
        </span>
        <span className="ml-auto" aria-hidden="true">
          {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        </span>
      </button>

      {open && (
        <ul
          className="mt-2 space-y-1 animate-fade-in"
          aria-label="Referenced source files"
        >
          {files.map((file) => (
            <li key={file} className="flex items-center gap-2 min-w-0">
              <span
                className="w-1 h-1 rounded-full bg-accent/40 flex-shrink-0"
                aria-hidden="true"
              />
              <code className="text-2xs font-mono text-ink-secondary truncate" title={file}>
                {file}
              </code>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}