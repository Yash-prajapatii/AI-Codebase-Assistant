import { Code2 } from "lucide-react";
import { useRepoStore } from "../../stores/repoStore";
import { RepoInput } from "../repo/RepoInput";
import { AnalysisProgress } from "../repo/AnalysisProgress";
import { RepoStatus } from "./RepoStatus";
import { RouteMap } from "./RouteMap";
import { QuickActions } from "./QuickActions";

export function Sidebar() {
  const status = useRepoStore((s) => s.status);

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col h-full bg-surface-overlay border-r border-surface-border overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-surface-border">
        <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
          <Code2 size={14} className="text-accent-glow" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-primary leading-none">
            Codebase AI
          </p>
          <p className="text-2xs text-ink-tertiary mt-0.5">
            RAG-powered assistant
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-3 py-4 space-y-5">
        {/* Repository section */}
        <section className="space-y-3">
          <p className="text-2xs text-ink-tertiary uppercase tracking-widest font-mono px-1">
            Repository
          </p>
          {status === "ready" ? <RepoStatus /> : <RepoInput />}
          {status === "analyzing" && <AnalysisProgress />}
          {status === "error" && <ErrorHint />}
        </section>

        {/* Route map — appears immediately after analysis, before first message */}
        {status === "ready" && <RouteMap />}

        {/* Divider */}
        <div className="border-t border-surface-border" />

        {/* Quick actions */}
        <QuickActions />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-surface-border">
        <p className="text-2xs text-ink-tertiary">
          Powered by Gemini + ChromaDB
        </p>
      </div>
    </aside>
  );
}

function ErrorHint() {
  const error = useRepoStore((s) => s.error);
  return (
    <div className="rounded-lg bg-danger/8 border border-danger/20 px-3 py-2.5">
      <p className="text-xs text-danger leading-relaxed">
        {error ?? "Analysis failed. Please try again."}
      </p>
    </div>
  );
}