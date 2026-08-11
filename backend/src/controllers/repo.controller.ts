import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { runIngestionPipeline } from "../rag/ingestion.pipeline.js";
import { sessionStore } from "../store/session.store.js";
import { RepoAnalyzeResponse } from "../types/index.js";

export async function getRouteMap(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { sessionId } = req.query;
    if (!sessionId || typeof sessionId !== "string") {
      res.status(400).json({
        error: "sessionId query param is required",
        code: "MISSING_SESSION_ID",
      });
      return;
    }
    const routeMap = sessionStore.getRouteMap(sessionId);
    res.status(200).json({ sessionId, routeMap });
  } catch (err) {
    next(err);
  }
}

const analyzeSchema = z.object({
  repoUrl: z.string().url().startsWith("https://github.com/"),
  sessionId: z.string().min(1).max(64),
});

export async function analyzeRepo(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = analyzeSchema.parse(req.body);
    const { repoUrl, sessionId } = body;

    if (sessionStore.has(sessionId)) {
      res.status(409).json({
        error: "Session already exists. Use a new sessionId.",
        code: "SESSION_EXISTS",
      });
      return;
    }

    const result = await runIngestionPipeline(repoUrl, sessionId);

    sessionStore.create({
      sessionId,
      repoName: result.repoName,
      owner: result.owner,
      collectionId: result.collectionId,
      fileCount: result.fileCount,
      chunkCount: result.chunkCount,
      analyzedAt: new Date(),
      messages: [],
      routeMap: result.routeMap,
    });

    const response: RepoAnalyzeResponse = {
      sessionId,
      repoName: result.repoName,
      owner: result.owner,
      defaultBranch: result.defaultBranch,
      fileCount: result.fileCount,
      chunkCount: result.chunkCount,
      collectionId: result.collectionId,
      analyzedAt: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}