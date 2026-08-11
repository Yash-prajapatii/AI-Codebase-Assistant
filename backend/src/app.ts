import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config/index.js";
import { corsMiddleware } from "./middleware/cors.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { timingLogger } from "./middleware/timingLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import repoRoutes from "./routes/repo.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: "1mb" }));

// ─── Logging + timing ─────────────────────────────────────────────────────────
app.use(requestLogger);
app.use(timingLogger);

// ─── Rate limiting (tight on the expensive endpoint) ─────────────────────────
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests", code: "RATE_LIMITED" },
});
app.use("/repo/analyze", limiter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use("/repo", repoRoutes);
app.use("/chat", chatRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found", code: "NOT_FOUND" });
});

// ─── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(config.PORT, () => {
  console.log(
    `🚀 AI Codebase Assistant backend — port ${config.PORT} [${config.NODE_ENV}]`
  );
});

export default app;