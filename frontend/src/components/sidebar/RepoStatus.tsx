import { FileCode2, Boxes, X, ExternalLink, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { useRepoStore } from "../../stores/repoStore";
import { useRepoAnalysis } from "../../hooks/useRepoAnalysis";

export function RepoStatus() {
  const { repoName, owner, fileCount, chunkCount, repoUrl } = useRepoStore();
  const { clear } = useRepoAnalysis();

  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 px-3.5 pt-3.5 pb-3">
        <div className="min-w-0 flex-1">
          {/* Status + name row */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <CheckCircle2
              size={12}
              className="text-success flex-shrink-0"
              aria-hidden="true"
            />
            <span
              className="text-xs font-semibold text-ink-primary truncate"
              title={`${owner}/${repoName}`}
            >
              {owner}/{repoName}
            </span>
          </div>

          {/* GitHub link */}
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              "inline-flex items-center gap-1 text-2xs text-ink-tertiary",
              "hover:text-accent-glow transition-colors duration-100",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 rounded"
            )}
          >
            <ExternalLink size={10} aria-hidden="true" />
            View on GitHub
          </a>
        </div>

        {/* Clear button */}
        <button
          onClick={clear}
          aria-label="Clear repository and start over"
          title="Clear repository"
          className={clsx(
            "flex-shrink-0 p-1 rounded-lg text-ink-tertiary",
            "hover:text-danger hover:bg-danger/10",
            "transition-colors duration-100",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-danger/40"
          )}
        >
          <X size={13} aria-hidden="true" />
        </button>
      </div>

      {/* Stats */}
      <div className="flex border-t border-surface-border divide-x divide-surface-border">
        <div className="flex-1 flex items-center gap-1.5 px-3.5 py-2.5">
          <FileCode2
            size={11}
            className="text-ink-tertiary flex-shrink-0"
            aria-hidden="true"
          />
          <span className="text-xs text-ink-secondary">
            <span className="font-semibold text-ink-primary">{fileCount}</span>
            {" "}files
          </span>
        </div>
        <div className="flex-1 flex items-center gap-1.5 px-3.5 py-2.5">
          <Boxes
            size={11}
            className="text-ink-tertiary flex-shrink-0"
            aria-hidden="true"
          />
          <span className="text-xs text-ink-secondary">
            <span className="font-semibold text-ink-primary">{chunkCount}</span>
            {" "}chunks
          </span>
        </div>
      </div>
    </div>
  );
}