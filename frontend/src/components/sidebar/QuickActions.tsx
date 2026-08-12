import {
  Map,
  FileText,
  Bug,
  ShieldCheck,
  Network,
  BookOpen,
  Lightbulb,
  Layers,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import type { QuickAction } from "../../types";
import { useChat } from "../../hooks/useChat";
import { useRepoStore } from "../../stores/repoStore";

const ACTIONS: QuickAction[] = [
  {
    id: "architecture",
    label: "Architecture Overview",
    icon: "Map",
    prompt:
      "Give me a high-level architecture overview of this repository. Describe the main modules, how they interact, and the overall design pattern used.",
  },
  {
    id: "readme",
    label: "Generate README",
    icon: "FileText",
    prompt:
      "Generate a comprehensive README.md for this repository including project description, tech stack, installation steps, usage examples, and project structure.",
  },
  {
    id: "bugs",
    label: "Find Potential Bugs",
    icon: "Bug",
    prompt:
      "Analyze the codebase and identify potential bugs, edge cases that aren't handled, or logic errors. Be specific about file paths and line numbers where possible.",
  },
  {
    id: "auth",
    label: "Explain Authentication",
    icon: "ShieldCheck",
    prompt:
      "Explain how authentication and authorization work in this codebase. Describe the auth flow, session management, middleware, and any security mechanisms in place.",
  },
  {
    id: "api",
    label: "Explain API Structure",
    icon: "Network",
    prompt:
      "Describe the API structure of this project. List all routes, their HTTP methods, expected inputs, and responses. Note any middleware applied.",
  },
  {
    id: "summarize",
    label: "Summarize Repository",
    icon: "BookOpen",
    prompt:
      "Give me a concise summary of what this repository does, who it is for, and its main features. Include the tech stack and any notable libraries used.",
  },
  {
    id: "improvements",
    label: "Suggest Improvements",
    icon: "Lightbulb",
    prompt:
      "Review the codebase and suggest concrete improvements for code quality, performance, security, and maintainability. Prioritize the most impactful changes.",
  },
  {
    id: "dependencies",
    label: "Analyze Dependencies",
    icon: "Layers",
    prompt:
      "Analyze the project's dependencies. List the main packages, their purpose, and flag any that look outdated, redundant, or potentially problematic.",
  },
];

const ICON_MAP: Record<string, LucideIcon> = {
  Map,
  FileText,
  Bug,
  ShieldCheck,
  Network,
  BookOpen,
  Lightbulb,
  Layers,
};

export function QuickActions() {
  const { sendMessage, isStreaming } = useChat();
  const repoStatus = useRepoStore((s) => s.status);
  const isReady    = repoStatus === "ready";
  const interactive = isReady && !isStreaming;

  return (
    <div>
      <p className="text-2xs text-ink-tertiary uppercase tracking-widest font-mono mb-2.5 px-1">
        Quick Actions
      </p>

      <div
        className="space-y-0.5"
        // When not ready, surface a tooltip on the container level so
        // users understand why all buttons are disabled.
        title={
          !isReady
            ? "Analyze a repository to enable quick actions"
            : isStreaming
            ? "Wait for the current response to finish"
            : undefined
        }
      >
        {ACTIONS.map((action) => {
          const Icon = ICON_MAP[action.icon];
          return (
            <button
              key={action.id}
              onClick={() => interactive && sendMessage(action.prompt)}
              disabled={!interactive}
              aria-disabled={!interactive}
              className={clsx(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left",
                "text-xs transition-all duration-100",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/40",
                interactive
                  ? [
                      "text-ink-secondary cursor-pointer",
                      "hover:text-ink-primary hover:bg-surface-hover",
                      "group",
                    ]
                  : "text-ink-tertiary cursor-not-allowed opacity-40 select-none"
              )}
            >
              {Icon && (
                <Icon
                  size={13}
                  aria-hidden="true"
                  className={clsx(
                    "flex-shrink-0 transition-colors duration-100",
                    interactive
                      ? "text-ink-tertiary group-hover:text-accent/80"
                      : "text-ink-tertiary"
                  )}
                />
              )}
              <span className="font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}