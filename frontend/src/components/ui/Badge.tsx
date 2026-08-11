import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "success" | "warning" | "danger";
  className?: string;
}

const VARIANTS = {
  default: "bg-surface-border text-ink-secondary",
  accent:  "bg-accent-muted text-accent-glow",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger:  "bg-danger/10 text-danger",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-medium font-mono tracking-wide",
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}