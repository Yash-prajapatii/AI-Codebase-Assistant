import { useState } from "react";
import { FileCode, ChevronDown, ChevronRight } from "lucide-react";

interface SourceCitationsProps {
  files: string[];
}

export function SourceCitations({ files }: SourceCitationsProps) {
  const [open, setOpen] = useState(false);
  if (files.length === 0) return null;

  return (
    <div className="mt-3 border-t border-surface-border pt-2.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-ink-tertiary hover:text-ink-secondary transition-colors"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <FileCode size={12} />
        <span>
          {files.length} referenced file{files.length !== 1 ? "s" : ""}
        </span>
      </button>
      {open && (
        <ul className="mt-2 space-y-1 pl-1 animate-fade-in">
          {files.map((file) => (
            <li key={file} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-accent-glow flex-shrink-0" />
              <code className="text-xs font-mono text-accent-glow/80 truncate">
                {file}
              </code>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}