import {
    AlertTriangle,
    RefreshCw,
    X,
    Clock,
    Lock,
    WifiOff,
    ServerCrash,
    type LucideIcon,
  } from "lucide-react";
  import clsx from "clsx";
  
  type Severity = "warning" | "error";
  
  interface ErrorDef {
    icon: LucideIcon;
    severity: Severity;
    title: string;
    body: string;
    hint: string;
  }
  
  function classify(raw: string | null): ErrorDef {
    const msg = (raw ?? "").toLowerCase();
  
    // AI quota exceeded (429)
    if (
      msg.includes("429") ||
      msg.includes("resource_exhausted") ||
      msg.includes("quota")
    ) {
      return {
        icon: Clock,
        severity: "warning",
        title: "AI quota reached",
        body:
          "The repository was analyzed successfully, but the AI service has reached its current usage limit.",
        hint:
          "Please try again later, or analyze a smaller repository.",
      };
    }
  
    // AI service unavailable (503)
    if (
      msg.includes("503") ||
      msg.includes("service unavailable") ||
      msg.includes("overloaded")
    ) {
      return {
        icon: ServerCrash,
        severity: "warning",
        title: "AI service is temporarily unavailable",
        body:
          "The AI service is currently experiencing high demand.",
        hint:
          "Please wait a moment and try again.",
      };
    }
  
    // Clone timeout
    if (
      msg.includes("408") ||
      msg.includes("timed out") ||
      msg.includes("timeout")
    ) {
      return {
        icon: Clock,
        severity: "error",
        title: "Clone timed out",
        body:
          "The repository took too long to download. This usually happens with very large repositories or slow network connections.",
        hint:
          "Try a smaller repository or try again later.",
      };
    }
  
    // Private repository
    if (
      msg.includes("401") ||
      msg.includes("403") ||
      msg.includes("private") ||
      msg.includes("authentication")
    ) {
      return {
        icon: Lock,
        severity: "error",
        title: "Private repository",
        body:
          "This repository requires authentication. Only public GitHub repositories are currently supported.",
        hint:
          "Use a public repository or configure authentication.",
      };
    }
  
    // Repository not found
    if (
      msg.includes("404") ||
      msg.includes("repository not found") ||
      msg.includes("not found")
    ) {
      return {
        icon: AlertTriangle,
        severity: "error",
        title: "Repository not found",
        body:
          "The repository could not be found, or it may be private.",
        hint:
          "Check the repository URL and make sure it is publicly accessible.",
      };
    }
  
    // Invalid URL
    if (msg.includes("invalid") || msg.includes("url")) {
      return {
        icon: AlertTriangle,
        severity: "error",
        title: "Invalid repository URL",
        body:
          "The URL must point to a valid public GitHub repository.",
        hint:
          "Example: https://github.com/owner/repository",
      };
    }
  
    // Unsupported repository
    if (msg.includes("no supported") || msg.includes("422")) {
      return {
        icon: AlertTriangle,
        severity: "warning",
        title: "No supported files found",
        body:
          "The repository doesn't contain supported source files for analysis.",
        hint:
          "Try a JavaScript, TypeScript, Python, Java or similar source code repository.",
      };
    }
  
    // Backend/network
    if (
      msg.includes("network") ||
      msg.includes("econnrefused") ||
      msg.includes("failed to fetch")
    ) {
      return {
        icon: WifiOff,
        severity: "error",
        title: "Connection error",
        body:
          "The application couldn't connect to the backend service.",
        hint:
          "Make sure the backend server and ChromaDB are running.",
      };
    }
  
    // Fallback
    return {
      icon: AlertTriangle,
      severity: "error",
      title: "Analysis failed",
      body:
        "Something went wrong while analyzing the repository.",
      hint:
        "Please try again. If the problem persists, check the backend logs.",
    };
  }
  
  interface ErrorCardProps {
    error: string | null;
    onRetry?: () => void;
    onDismiss?: () => void;
  }
  
  export function ErrorCard({
    error,
    onRetry,
    onDismiss,
  }: ErrorCardProps) {
    const def = classify(error);
    const Icon = def.icon;
  
    const isWarning = def.severity === "warning";
  
    const borderCls = isWarning
      ? "border-warning/20"
      : "border-danger/20";
  
    const bgCls = isWarning
      ? "bg-warning/5"
      : "bg-danger/5";
  
    const iconBgCls = isWarning
      ? "bg-warning/10 text-warning"
      : "bg-danger/10 text-danger";
  
    const titleCls = isWarning
      ? "text-warning"
      : "text-danger";
  
    const hintBgCls = isWarning
      ? "bg-warning/8"
      : "bg-danger/8";
  
    const dividerCls = isWarning
      ? "border-warning/15"
      : "border-danger/15";
  
    const retryBgCls = isWarning
      ? "bg-warning/10 text-warning hover:bg-warning/20"
      : "bg-danger/10 text-danger hover:bg-danger/20";
  
    return (
      <div
        role="alert"
        className={clsx(
          "rounded-xl border overflow-hidden animate-fade-in",
          borderCls,
          bgCls
        )}
      >
        <div className="flex items-start gap-3 px-4 pt-4 pb-3">
          <div
            className={clsx(
              "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
              iconBgCls
            )}
          >
            <Icon size={14} aria-hidden="true" />
          </div>
  
          <div className="min-w-0">
            <p className={clsx("text-xs font-semibold mb-1", titleCls)}>
              {def.title}
            </p>
  
            <p className="text-xs text-ink-secondary leading-relaxed">
              {def.body}
            </p>
          </div>
        </div>
  
        <div
          className={clsx(
            "mx-4 mb-3 px-3 py-2 rounded-lg text-2xs text-ink-tertiary leading-relaxed",
            hintBgCls
          )}
        >
          {def.hint}
        </div>
  
        {(onRetry || onDismiss) && (
          <div
            className={clsx(
              "flex items-center gap-2 px-4 py-2.5 border-t",
              dividerCls
            )}
          >
            {onRetry && (
              <button
                onClick={onRetry}
                className={clsx(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-2xs font-medium transition-colors",
                  retryBgCls
                )}
              >
                <RefreshCw size={11} aria-hidden="true" />
                Retry
              </button>
            )}
  
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-2xs font-medium text-ink-tertiary hover:text-ink-secondary hover:bg-surface-hover transition-colors"
              >
                <X size={11} aria-hidden="true" />
                Dismiss
              </button>
            )}
          </div>
        )}
      </div>
    );
  }