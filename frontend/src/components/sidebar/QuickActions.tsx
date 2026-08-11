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
  
    return (
      <div>
        <p className="text-2xs text-ink-tertiary uppercase tracking-widest font-mono mb-2.5">
          Quick Actions
        </p>
        <div className="space-y-1">
          {ACTIONS.map((action) => {
            const Icon = ICON_MAP[action.icon];
            return (
              <button
                key={action.id}
                onClick={() => sendMessage(action.prompt)}
                disabled={!isReady || isStreaming}
                className={clsx(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left",
                  "text-xs font-medium transition-all",
                  isReady && !isStreaming
                    ? "text-ink-secondary hover:text-ink-primary hover:bg-surface-hover"
                    : "text-ink-tertiary cursor-not-allowed opacity-50"
                )}
              >
                {Icon && (
                  <Icon
                    size={13}
                    className={clsx(
                      isReady ? "text-accent/70" : "text-ink-tertiary"
                    )}
                  />
                )}
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }