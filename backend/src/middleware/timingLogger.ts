import { Request, Response, NextFunction } from "express";
import { config } from "../config/index.js";

// Only instrument these two routes — they are the expensive ones
const TIMED_ROUTES: Record<string, string> = {
  "POST:/repo/analyze": "ingestion",
  "POST:/chat": "chat",
};

function formatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}

/**
 * Development-only timing middleware.
 *
 * For /repo/analyze: logs total wall-clock ingestion time.
 * For /chat: logs two metrics:
 *   - time-to-first-token (retrieval + LLM startup latency)
 *   - total stream duration (entire response)
 *
 * These numbers are useful when optimising the retrieval pipeline
 * and for demonstrating latency improvements in interviews.
 */
export function timingLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (config.NODE_ENV !== "development") {
    next();
    return;
  }

  const routeKey = `${req.method}:${req.path}`;
  const label = TIMED_ROUTES[routeKey];

  if (!label) {
    next();
    return;
  }

  const start = Date.now();
  let firstByteLogged = false;

  // Intercept res.write to capture time-to-first-token on SSE streams
  const originalWrite = res.write.bind(res) as typeof res.write;
  res.write = function (
    chunk: unknown,
    encodingOrCb?: unknown,
    cb?: unknown
  ): boolean {
    if (!firstByteLogged && label === "chat") {
      const ttfb = Date.now() - start;
      console.log(`⏱  [${label}] time-to-first-token: ${formatMs(ttfb)}`);
      firstByteLogged = true;
    }
    return (originalWrite as Function)(chunk, encodingOrCb, cb);
  } as typeof res.write;

  res.on("finish", () => {
    const total = Date.now() - start;
    if (label === "ingestion") {
      console.log(
        `⏱  [${label}] total: ${formatMs(total)}  status: ${res.statusCode}`
      );
    } else {
      console.log(
        `⏱  [${label}] total (stream close): ${formatMs(total)}  status: ${
          res.statusCode
        }`
      );
    }
  });

  next();
}