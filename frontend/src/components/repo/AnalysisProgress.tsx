import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import clsx from "clsx";

const STEPS = [
  "Cloning repository",
  "Parsing source files",
  "Chunking documents",
  "Generating embeddings",
  "Indexing into ChromaDB",
];

const STEP_DURATION = 4200;

export function AnalysisProgress() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= STEPS.length - 1) return;
    const t = setTimeout(
      () => setCurrentStep((s) => s + 1),
      STEP_DURATION
    );
    return () => clearTimeout(t);
  }, [currentStep]);

  return (
    <div className="py-3 px-1">
      <p className="text-xs text-ink-tertiary uppercase tracking-widest mb-3 font-mono">
        Building index
      </p>
      <div className="space-y-2.5">
        {STEPS.map((step, idx) => {
          const done   = idx < currentStep;
          const active = idx === currentStep;
          return (
            <div
              key={step}
              className={clsx(
                "flex items-center gap-2.5 text-sm transition-all duration-300",
                done   && "text-ink-secondary",
                active && "text-ink-primary",
                !done && !active && "text-ink-tertiary"
              )}
            >
              {done ? (
                <CheckCircle2
                  size={14}
                  className="text-success flex-shrink-0"
                />
              ) : active ? (
                <span className="h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              ) : (
                <span className="h-3.5 w-3.5 flex-shrink-0 rounded-full border border-surface-border" />
              )}
              <span className={clsx(active && "font-medium")}>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}