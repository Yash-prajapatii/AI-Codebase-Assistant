import { Code2 } from "lucide-react";
import { useRepoStore } from "../../stores/repoStore";
import { useRepoAnalysis } from "../../hooks/useRepoAnalysis";
import { RepoInput } from "../repo/RepoInput";
import { AnalysisProgress } from "../repo/AnalysisProgress";
import { RepoStatus } from "./RepoStatus";
import { RouteMap } from "./RouteMap";
import { QuickActions } from "./QuickActions";
import { ErrorCard } from "../ui/ErrorCard";

export function Sidebar() {
  const status  = useRepoStore((s) => s.status);
  const error   = useRepoStore((s) => s.error);
  const repoUrl = useRepoStore((s) => s.repoUrl);
  const { analyze, clear } = useRepoAnalysis();

  // Retry re-runs the analysis with the same URL already stored in the repo store.
  // `analyze` handles generating a fresh session ID internally.
  const handleRetry = () => {
    if (repoUrl) analyze(repoUrl);
  };

  return (
    <aside
      className="w-72 flex-shrink-0 flex flex-col h-full bg-surface-overlay border-r border-surface-border overflow-y-auto"
      aria-label="Sidebar"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-surface-border">
        <div
          className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center"
          aria-hidden="true"
        >
          <Code2 size={14} className="text-accent-glow" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-primary leading-none">
            AI Codebase Assistant
          </p>
          <p className="text-2xs text-ink-tertiary mt-0.5">Understand repositories with AI - RAG-powered assistant</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {/* Repository section */}
        <section className="space-y-3" aria-labelledby="repo-section-label">
          <p
            id="repo-section-label"
            className="text-2xs text-ink-tertiary uppercase tracking-widest font-mono px-1"
          >
            Repository
          </p>

          {/* Show RepoStatus when ready, otherwise always show input */}
          {status === "ready" ? (
            <RepoStatus />
          ) : (
            <RepoInput />
          )}

          {/* Analysis progress — only shown while analyzing */}
          {status === "analyzing" && <AnalysisProgress />}

          {/* Error card — only shown on error */}
          {status === "error" && (
            <ErrorCard
              error={error}
              onRetry={handleRetry}
              onDismiss={clear}
            />
          )}
        </section>

        {/* Route map — visible only after successful analysis */}
        {status === "ready" && <RouteMap />}

        {/* Divider */}
        <div className="border-t border-surface-border" aria-hidden="true" />

        {/* Quick actions */}
        <QuickActions />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-surface-border flex-shrink-0">
        <p className="text-2xs text-ink-tertiary">
          Gemini • ChromaDB • RAG Pipeline
        </p>
      </div>
    </aside>
  );
}