import { GitBranch, FileSearch, Scissors, Brain, Database } from "lucide-react";
import clsx from "clsx";

// These labels map to the actual backend pipeline stages.
// Since the backend sends no progress events, we show them as
// an indeterminate sequence — the spinner on the whole card
// communicates that work is ongoing without pretending we know
// which specific step is running.
const STAGES = [
  { icon: GitBranch,   label: "Cloning repository",       desc: "Fetching source files from GitHub" },
  { icon: FileSearch,  label: "Parsing files",             desc: "Filtering and reading supported file types" },
  { icon: Scissors,    label: "Building knowledge base",   desc: "Splitting files into semantic chunks" },
  { icon: Brain,       label: "Creating embeddings",       desc: "Generating vector representations" },
  { icon: Database,    label: "Indexing",                  desc: "Storing embeddings in ChromaDB" },
] as const;

export function AnalysisProgress() {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised overflow-hidden animate-fade-in">
      {/* Card header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-surface-border">
        <span
          className="w-3.5 h-3.5 rounded-full border-2 border-accent/30 border-t-accent animate-spin flex-shrink-0"
          aria-hidden="true"
        />
        <span className="text-xs font-semibold text-ink-primary">
          Analyzing Repository
        </span>
        <span className="ml-auto text-2xs text-ink-tertiary font-mono">
          
        </span>
      </div>

      {/* Pipeline stages */}
      <div className="px-4 py-3 space-y-0" role="status" aria-label="Analysis in progress">
        {STAGES.map(({ icon: Icon, label, desc }, idx) => (
          <div
            key={label}
            className={clsx("flex items-start gap-3 py-2.5")}
          >
            {/* Icon column with connector */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-surface-overlay border border-surface-border flex items-center justify-center">
                <Icon size={11} className="text-ink-tertiary" aria-hidden="true" />
              </div>
              {idx < STAGES.length - 1 && (
                <div className="w-px h-4 mt-1 bg-surface-border" aria-hidden="true" />
              )}
            </div>

            {/* Label column */}
            <div className="pb-1 min-w-0">
              <p className="text-xs font-medium text-ink-secondary leading-none mb-0.5">
                {label}
              </p>
              <p className="text-2xs text-ink-tertiary leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-surface-border">
        <p className="text-2xs text-ink-tertiary">
        Repository analysis time depends on repository size and AI service availability.
        </p>
      </div>
    </div>
  );
}