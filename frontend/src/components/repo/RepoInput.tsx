import { useState, FormEvent } from "react";
import { Github, Search } from "lucide-react";
import clsx from "clsx";
import { useRepoAnalysis } from "../../hooks/useRepoAnalysis";
import { useRepoStore } from "../../stores/repoStore";
import { useToast } from "../ui/Toast";

const GITHUB_PATTERN =
  /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;

export function RepoInput() {
  const [url, setUrl]     = useState("");
  const [error, setError] = useState<string | null>(null);
  const { analyze }       = useRepoAnalysis();
  const status            = useRepoStore((s) => s.status);
  const { addToast }      = useToast();
  const isLoading         = status === "analyzing";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Enter a repository URL.");
      return;
    }
    if (!GITHUB_PATTERN.test(url.trim())) {
      setError("Must be: https://github.com/owner/repo");
      return;
    }
    setError(null);
    try {
      await analyze(url.trim());
    } catch {
      addToast("Analysis failed. Check the URL and try again.", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center">
        <Github
          size={15}
          className="absolute left-3.5 text-ink-tertiary pointer-events-none"
        />
        <input
          type="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(null); }}
          placeholder="https://github.com/owner/repo"
          disabled={isLoading}
          spellCheck={false}
          className={clsx(
            "w-full bg-surface-base border rounded-lg pl-9 pr-28 py-2.5",
            "text-sm text-ink-primary placeholder:text-ink-tertiary font-mono",
            "focus:outline-none focus:ring-1 transition-all",
            error
              ? "border-danger/60 focus:ring-danger/40"
              : "border-surface-border focus:border-accent/60 focus:ring-accent/20",
            isLoading && "opacity-60 cursor-not-allowed"
          )}
        />
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className={clsx(
            "absolute right-1.5 flex items-center gap-1.5 px-3 py-1.5 rounded-md",
            "text-xs font-medium transition-all",
            isLoading || !url.trim()
              ? "text-ink-tertiary cursor-not-allowed"
              : "bg-accent hover:bg-accent-dim text-white shadow-glow-sm"
          )}
        >
          {isLoading ? (
            <>
              <span className="h-3 w-3 rounded-full border-2 border-ink-tertiary border-t-transparent animate-spin" />
              Analyzing
            </>
          ) : (
            <>
              <Search size={12} />
              Analyze
            </>
          )}
        </button>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-danger pl-1">{error}</p>
      )}
    </form>
  );
}