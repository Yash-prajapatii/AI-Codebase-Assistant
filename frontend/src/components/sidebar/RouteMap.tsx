import { useState } from "react";
import { Network, ChevronDown, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { useRepoStore } from "../../stores/repoStore";
import type { HttpMethod, RouteEntry } from "../../types";

const METHOD_STYLES: Record<HttpMethod, string> = {
  GET:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  POST:   "bg-blue-500/15   text-blue-400   border-blue-500/25",
  PUT:    "bg-amber-500/15  text-amber-400  border-amber-500/25",
  PATCH:  "bg-violet-500/15 text-violet-400 border-violet-500/25",
  DELETE: "bg-red-500/15    text-red-400    border-red-500/25",
};

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center px-1.5 py-px rounded border",
        "text-2xs font-mono font-semibold tracking-wide flex-shrink-0 w-14 text-center",
        METHOD_STYLES[method] ??
          "bg-surface-border text-ink-secondary border-surface-border"
      )}
    >
      {method}
    </span>
  );
}

function RouteRow({ route }: { route: RouteEntry }) {
  const [showFile, setShowFile] = useState(false);

  return (
    <div
      className="border-b border-surface-border/50 last:border-0"
      onMouseEnter={() => setShowFile(true)}
      onMouseLeave={() => setShowFile(false)}
    >
      <div className="flex items-center gap-2 px-2 py-1.5">
        <MethodBadge method={route.method} />
        <span
          className="flex-1 text-xs font-mono text-ink-primary truncate"
          title={route.path}
        >
          {route.path}
        </span>
      </div>
      {showFile && (
        <div className="px-2 pb-1.5 animate-fade-in">
          <span className="text-2xs font-mono text-ink-tertiary truncate block">
            {route.file}
            <span className="text-ink-tertiary/50">:{route.line}</span>
          </span>
        </div>
      )}
    </div>
  );
}

export function RouteMap() {
  const routeMap = useRepoStore((s) => s.routeMap);
  const [open, setOpen] = useState(true);

  if (routeMap.length === 0) return null;

  const counts = routeMap.reduce<Partial<Record<HttpMethod, number>>>(
    (acc, r) => {
      acc[r.method] = (acc[r.method] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <section>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-1.5 px-1 mb-2"
      >
        {open ? (
          <ChevronDown size={11} className="text-ink-tertiary" />
        ) : (
          <ChevronRight size={11} className="text-ink-tertiary" />
        )}
        <Network size={11} className="text-accent/70" />
        <p className="text-2xs text-ink-tertiary uppercase tracking-widest font-mono">
          Route Map
        </p>
        <span className="ml-auto text-2xs font-mono text-ink-tertiary">
          {routeMap.length}
        </span>
      </button>

      {open && (
        <div className="animate-fade-in">
          <div className="flex flex-wrap gap-1 mb-2 px-1">
            {(Object.entries(counts) as [HttpMethod, number][]).map(
              ([method, count]) => (
                <span
                  key={method}
                  className={clsx(
                    "inline-flex items-center gap-1 px-1.5 py-px rounded border text-2xs font-mono",
                    METHOD_STYLES[method]
                  )}
                >
                  {method}{" "}
                  <span className="opacity-60">×{count}</span>
                </span>
              )
            )}
          </div>
          <div className="rounded-lg border border-surface-border bg-surface-base overflow-hidden">
            {routeMap.map((route, i) => (
              <RouteRow
                key={`${route.method}-${route.path}-${i}`}
                route={route}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}