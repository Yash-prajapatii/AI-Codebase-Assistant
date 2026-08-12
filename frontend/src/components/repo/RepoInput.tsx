import { useState, FormEvent, useEffect } from "react";
import { Github, ArrowRight, AlertCircle } from "lucide-react";
import clsx from "clsx";
import { useRepoAnalysis } from "../../hooks/useRepoAnalysis";
import { useRepoStore } from "../../stores/repoStore";
import { useToast } from "../ui/Toast";

const GITHUB_PATTERN = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;

// Pre-filled example URLs shown below the input.
// Clicking one sets the input value — no side effects, no store writes.
const QUICK_URLS = [
  { label: "expressjs/express", url: "https://github.com/expressjs/express" },
  { label: "gothinkster/realworld", url: "https://github.com/gothinkster/node-express-realworld-example-app" },
];

interface RepoInputProps {
  /** Optional pre-filled URL — e.g. coming from a parent that wants to suggest a repo */
  defaultUrl?: string;
}

export function RepoInput({ defaultUrl }: RepoInputProps) {
  const [url, setUrl]     = useState(defaultUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const { analyze }       = useRepoAnalysis();
  const status            = useRepoStore((s) => s.status);
  const { addToast }      = useToast();
  const isLoading         = status === "analyzing";

  // Sync if parent changes the default
  useEffect(() => {
    if (defaultUrl) {
      setUrl(defaultUrl);
      setError(null);
    }
  }, [defaultUrl]);

  const validate = (value: string): string | null => {
    if (!value.trim()) return "Enter a GitHub repository URL";
    if (!GITHUB_PATTERN.test(value.trim())) return "Enter a valid public GitHub repository URL.";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    const err = validate(trimmed);
    if (err) { setError(err); return; }
    setError(null);
    try {
      await analyze(trimmed);
    } catch {
      addToast("Analysis failed. Check the URL and try again.", "error");
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} noValidate>
        {/* Input container — the whole thing acts as the field */}
        <div
          className={clsx(
            "flex items-center rounded-xl border bg-surface-base transition-all duration-150",
            isLoading
              ? "border-surface-border opacity-50 pointer-events-none"
              : error
              ? "border-danger/40 focus-within:border-danger/60 focus-within:ring-1 focus-within:ring-danger/15"
              : "border-surface-border focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/15"
          )}
        >
          <Github
            size={14}
            className="ml-3 text-ink-tertiary flex-shrink-0"
            aria-hidden="true"
          />
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(null); }}
            placeholder="https://github.com/owner/repo"
            disabled={isLoading}
            spellCheck={false}
            autoComplete="off"
            aria-label="GitHub repository URL"
            aria-invalid={!!error}
            aria-describedby={error ? "repo-url-error" : undefined}
            className="flex-1 bg-transparent py-2.5 px-2 text-sm text-ink-primary placeholder:text-ink-tertiary font-mono focus:outline-none min-w-0"
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            aria-label={isLoading ? "Analyzing" : "Analyze repository"}
            className={clsx(
              "flex-shrink-0 flex items-center gap-1.5 m-1.5 px-3 py-1.5 rounded-lg",
              "text-xs font-medium transition-all duration-150",
              isLoading
                ? "bg-surface-overlay text-ink-tertiary"
                : !url.trim()
                ? "text-ink-tertiary"
                : "bg-accent hover:bg-accent-dim text-white cursor-pointer"
            )}
          >
            {isLoading ? (
              <>
                <span
                  className="w-3 h-3 rounded-full border-2 border-ink-tertiary/30 border-t-ink-tertiary/80 animate-spin"
                  aria-hidden="true"
                />
                Analyzing...
              </>
            ) : (
              <>
                Analyze
                <ArrowRight size={11} aria-hidden="true" />
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <p
            id="repo-url-error"
            role="alert"
            className="flex items-center gap-1.5 mt-1.5 pl-1 text-xs text-danger animate-fade-in"
          >
            <AlertCircle size={11} aria-hidden="true" />
            {error}
          </p>
        )}
      </form>

      {/* Quick-fill examples */}
      {!isLoading && (
        <div className="space-y-0.5">
          {QUICK_URLS.map(({ label, url: exUrl }) => (
            <button
              key={exUrl}
              type="button"
              onClick={() => { setUrl(exUrl); setError(null); }}
              className={clsx(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left",
                "text-2xs font-mono text-ink-tertiary",
                "hover:text-ink-secondary hover:bg-surface-hover",
                "transition-colors duration-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
              )}
            >
              <Github size={10} className="flex-shrink-0" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}