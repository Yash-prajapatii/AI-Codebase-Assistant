import { GitBranch, FileCode, Boxes, X, ExternalLink } from "lucide-react";
import { useRepoStore } from "../../stores/repoStore";
import { useRepoAnalysis } from "../../hooks/useRepoAnalysis";
import { Badge } from "../ui/Badge";

export function RepoStatus() {
  const { repoName, owner, fileCount, chunkCount, repoUrl } = useRepoStore();
  const { clear } = useRepoAnalysis();

  return (
    <div className="rounded-lg bg-surface-overlay border border-surface-border p-3 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <GitBranch size={12} className="text-accent flex-shrink-0" />
            <span className="text-xs font-semibold text-ink-primary truncate">
              {owner}/{repoName}
            </span>
          </div>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 mt-0.5 text-2xs text-ink-tertiary hover:text-accent-glow transition-colors"
          >
            <ExternalLink size={10} />
            View on GitHub
          </a>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="success">indexed</Badge>
          <button
            onClick={clear}
            className="text-ink-tertiary hover:text-danger transition-colors p-0.5 rounded"
            title="Clear repository"
          >
            <X size={13} />
          </button>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
          <FileCode size={11} className="text-ink-tertiary" />
          <span>{fileCount} files</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
          <Boxes size={11} className="text-ink-tertiary" />
          <span>{chunkCount} chunks</span>
        </div>
      </div>
    </div>
  );
}