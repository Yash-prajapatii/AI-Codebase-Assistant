import { useEffect, useRef } from "react";
import { GitBranch, Sparkles, Code2, FileSearch, Zap, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { useChatStore } from "../../stores/chatStore";
import { useRepoStore } from "../../stores/repoStore";
import { useChat } from "../../hooks/useChat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

// ─── Static content ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: FileSearch,
    title: "Semantic search",
    desc: "Finds relevant code across the entire repository",
  },
  {
    icon: Code2,
    title: "Code-aware answers",
    desc: "Understands structure, patterns, and dependencies",
  },
  {
    icon: Zap,
    title: "Instant insights",
    desc: "Architecture, bugs, auth flows — on demand",
  },
] as const;

const EXAMPLE_QUESTIONS = [
  "Explain the overall architecture",
  "Where is authentication handled?",
  "Find potential bugs or edge cases",
  "How does the API routing work?",
  "Generate a README for this project",
  "Summarize this repository",
];

export const EXAMPLE_REPOS = [
  "https://github.com/amannn/vite-react-starter",
  "https://github.com/Yash-prajapatii/Neurotrack",
  "https://github.com/TausifM/react-typescript-todo-app",
];

// ─── Main component ────────────────────────────────────────────────────────────

export function ChatWindow() {
  const messages    = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const repoStatus  = useRepoStore((s) => s.status);
  const repoName    = useRepoStore((s) => s.repoName);
  const fileCount   = useRepoStore((s) => s.fileCount);
  const chunkCount  = useRepoStore((s) => s.chunkCount);
  const { sendMessage } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isReady     = repoStatus === "ready";
  const isAnalyzing = repoStatus === "analyzing";

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-border">
        {messages.length === 0 ? (
          <EmptyState
            isReady={isReady}
            isAnalyzing={isAnalyzing}
            repoName={repoName}
            fileCount={fileCount}
            chunkCount={chunkCount}
            onAskQuestion={sendMessage}
          />
        ) : (
          <div className="pb-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput
        onSend={sendMessage}
        disabled={!isReady}
        isStreaming={isStreaming}
      />
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  isReady: boolean;
  isAnalyzing: boolean;
  repoName: string;
  fileCount: number;
  chunkCount: number;
  onAskQuestion: (q: string) => void;
}

function EmptyState({
  isReady,
  isAnalyzing,
  repoName,
  fileCount,
  chunkCount,
  onAskQuestion,
}: EmptyStateProps) {
  // Analyzing state — minimal, honest
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <span
              className="w-5 h-5 rounded-full border-2 border-accent/30 border-t-accent animate-spin"
              aria-hidden="true"
            />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-ink-primary mb-1">
            Building repository index
          </p>
          <p className="text-sm text-ink-tertiary max-w-xs leading-relaxed">
            Cloning, parsing, and indexing your repository. This usually takes 30–90 seconds.
          </p>
        </div>
      </div>
    );
  }

  // Ready state — show suggestions
  if (isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-10">
        <div className="w-full max-w-xl">
          {/* Ready header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
            <span className="text-xs text-success font-medium">Ready</span>
          </div>

          <h2 className="text-xl font-semibold text-ink-primary tracking-tight mb-1">
            {repoName}
          </h2>
          <p className="text-sm text-ink-tertiary mb-8">
            {fileCount} files · {chunkCount} chunks indexed
          </p>

          {/* Suggested questions */}
          <p className="text-xs text-ink-tertiary uppercase tracking-widest font-mono mb-3">
            Suggested questions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => onAskQuestion(q)}
                className={clsx(
                  "flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left",
                  "border border-surface-border bg-surface-raised",
                  "text-sm text-ink-secondary",
                  "hover:border-accent/30 hover:bg-surface-hover hover:text-ink-primary",
                  "transition-all duration-150 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/50"
                )}
              >
                <span className="leading-snug">{q}</span>
                <ArrowRight
                  size={13}
                  className="flex-shrink-0 text-ink-tertiary group-hover:text-accent/70 transition-colors"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Idle state — the landing/onboarding experience
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-10">
      <div className="w-full max-w-xl">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mb-5">
            <Sparkles size={22} className="text-accent" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold text-ink-primary tracking-tight mb-2">
            Understand any GitHub repository
          </h1>
          <p className="text-base text-ink-secondary max-w-sm mx-auto leading-relaxed">
            Analyze public GitHub repositories using Retrieval-Augmented Generation (RAG). 
            Explore architecture, trace execution flows, understand APIs, and answer questions with source-backed responses.
          </p>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col gap-2.5 p-4 rounded-xl border border-surface-border bg-surface-raised"
            >
              <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                <Icon size={13} className="text-accent" aria-hidden="true" />
              </div>
              <p className="text-xs font-semibold text-ink-primary leading-snug">
                {title}
              </p>
              <p className="text-2xs text-ink-tertiary leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* Example repos */}
        <div className="mb-8">
          <p className="text-xs text-ink-tertiary uppercase tracking-widest font-mono mb-3">
            Try with
          </p>
          <div className="space-y-1.5">
            {EXAMPLE_REPOS.map((url) => {
              const label = url.replace("https://github.com/", "");
              return (
                <div
                  key={url}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface-raised"
                >
                  <GitBranch
                    size={12}
                    className="text-ink-tertiary flex-shrink-0"
                    aria-hidden="true"
                  />
                  <code className="text-xs text-ink-secondary font-mono flex-1 truncate">
                    {label}
                  </code>
                  <span className="text-2xs text-ink-tertiary font-mono px-2 py-0.5 rounded bg-surface-overlay border border-surface-border">
                    public
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-2xs text-ink-tertiary pl-1">
            Copy a URL above and paste it in the sidebar to analyze.
          </p>
        </div>

        {/* Example questions — decorative */}
        <div>
          <p className="text-xs text-ink-tertiary uppercase tracking-widest font-mono mb-3">
            Example questions
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.slice(0, 4).map((q) => (
              <span
                key={q}
                className="px-2.5 py-1 rounded-full border border-surface-border bg-surface-raised text-2xs text-ink-tertiary"
              >
                {q}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}