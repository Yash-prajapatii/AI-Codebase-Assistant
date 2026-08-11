import { DynamicTool } from "@langchain/core/tools";
import { ParsedFile, RouteEntry, HttpMethod } from "../types/index.js";

// ─── Pattern registry ─────────────────────────────────────────────────────────

// Matches: router.get('/path', ...) app.post('/path', ...) etc.
// Capture groups: (1) method  (2) route path
const EXPRESS_ROUTE_RE =
  /(?:router|app)\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi;

// Next.js App Router: files at app/api/**/route.ts export named HTTP handlers
const NEXT_APP_ROUTER_FILE_RE = /[/\\]app[/\\]api[/\\]/;
const NEXT_APP_ROUTER_EXPORT_RE =
  /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(/g;

// Next.js Pages Router: files under pages/api/ are API endpoints
const NEXT_PAGES_FILE_RE = /[/\\]pages[/\\]api[/\\]/;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lineOf(content: string, charIndex: number): number {
  return content.slice(0, charIndex).split("\n").length;
}

function nextJsFilePathToRoute(filePath: string): string {
  return (
    filePath
      .replace(/\\/g, "/")
      .replace(/^.*?(pages|app)/, "")
      .replace(/\/route\.(ts|js|tsx|jsx)$/, "") // App Router: strip /route.ext
      .replace(/\.(ts|js|tsx|jsx)$/, "") // Pages Router: strip extension
      .replace(/\/index$/, "") // /index → ""
      || "/"
  );
}

// ─── Per-file scan ────────────────────────────────────────────────────────────

function scanFile(file: ParsedFile): RouteEntry[] {
  const entries: RouteEntry[] = [];
  const { content, filePath } = file;

  const isCodeFile = [
    "javascript",
    "typescript",
    "javascriptreact",
    "typescriptreact",
  ].includes(file.language);

  if (!isCodeFile) return entries;

  // Express routes
  let match: RegExpExecArray | null;
  EXPRESS_ROUTE_RE.lastIndex = 0;
  while ((match = EXPRESS_ROUTE_RE.exec(content)) !== null) {
    entries.push({
      method: match[1].toUpperCase() as HttpMethod,
      path: match[2],
      file: filePath,
      line: lineOf(content, match.index),
    });
  }

  // Next.js App Router
  if (NEXT_APP_ROUTER_FILE_RE.test(filePath)) {
    NEXT_APP_ROUTER_EXPORT_RE.lastIndex = 0;
    const routePath = nextJsFilePathToRoute(filePath);
    let exportMatch: RegExpExecArray | null;
    while (
      (exportMatch = NEXT_APP_ROUTER_EXPORT_RE.exec(content)) !== null
    ) {
      entries.push({
        method: exportMatch[1] as HttpMethod,
        path: routePath,
        file: filePath,
        line: lineOf(content, exportMatch.index),
      });
    }
  }

  // Next.js Pages Router
  if (NEXT_PAGES_FILE_RE.test(filePath) && entries.length === 0) {
    const routePath = nextJsFilePathToRoute(filePath);
    if (/export\s+default\s+/.test(content)) {
      entries.push({
        method: "GET" as HttpMethod,
        path: routePath,
        file: filePath,
        line: 1,
      });
    }
  }

  return entries;
}

// ─── LangChain DynamicTool ────────────────────────────────────────────────────

/**
 * Creates a LangChain DynamicTool wrapping the route scanner.
 * Input: JSON-serialised ParsedFile[]
 * Output: JSON-serialised RouteEntry[]
 *
 * Using DynamicTool keeps this composable and testable independently
 * of the ingestion pipeline. It can be added to any LangChain agent
 * or invoked directly without an LLM roundtrip.
 */
export function createRouteDiscoveryTool(): DynamicTool {
  return new DynamicTool({
    name: "route_discovery",
    description:
      "Scans repository source files for Express and Next.js API route " +
      "definitions. Returns a JSON array of { method, path, file, line }.",

    func: async (input: string): Promise<string> => {
      let files: ParsedFile[];
      try {
        files = JSON.parse(input) as ParsedFile[];
      } catch {
        return JSON.stringify({
          error: "Invalid input: expected JSON array of ParsedFile",
        });
      }

      const allRoutes: RouteEntry[] = [];
      for (const file of files) {
        allRoutes.push(...scanFile(file));
      }

      // Deduplicate exact (method + path + file) triples
      const seen = new Set<string>();
      const unique = allRoutes.filter((r) => {
        const key = `${r.method}:${r.path}:${r.file}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      console.log(
        `[routeDiscovery] Found ${unique.length} routes across ${files.length} files`
      );
      return JSON.stringify(unique);
    },
  });
}

/** Convenience wrapper — invoke the tool directly without an agent loop. */
export async function discoverRoutes(
  files: ParsedFile[]
): Promise<RouteEntry[]> {
  const tool = createRouteDiscoveryTool();
  const result = await tool.invoke(JSON.stringify(files));
  try {
    return JSON.parse(result) as RouteEntry[];
  } catch {
    console.error("[routeDiscovery] Failed to parse tool output:", result);
    return [];
  }
}