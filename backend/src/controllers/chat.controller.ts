import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { runRetrievalPipeline } from "../rag/retrieval.pipeline.js";
import { sessionStore } from "../store/session.store.js";
import { ChatMessage, ChatHistoryResponse } from "../types/index.js";

const chatSchema = z.object({
  sessionId: z.string().min(1).max(64),
  message: z.string().min(1).max(8000),
});

export async function chat(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = chatSchema.parse(req.body);
    const { sessionId, message } = body;

    const session = sessionStore.get(sessionId);

    // Persist user message before streaming so history is complete
    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };
    sessionStore.appendMessage(sessionId, userMsg);
    sessionStore.pruneHistory(sessionId, 20);

    // Exclude the just-added user message from history passed to Gemini
    // (Gemini receives it as the sendMessageStream argument, not in history)
    const chatHistory = sessionStore.getMessages(sessionId).slice(0, -1);

    const { fullText, sourceFiles } = await runRetrievalPipeline(
      {
        query: message,
        collectionId: session.collectionId,
        sessionId,
        chatHistory,
      },
      session.repoName,
      res
    );

    // Persist assistant response after stream ends
    sessionStore.appendMessage(sessionId, {
      id: uuidv4(),
      role: "assistant",
      content: fullText,
      sourceFiles,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    if (!res.headersSent) {
      next(err);
    } else {
      // SSE headers already sent — write error into the stream then close
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          message: "Stream error occurred",
        })}\n\n`
      );
      res.end();
    }
  }
}

export async function getChatHistory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      res.status(400).json({ error: "sessionId is required" });
      return;
    }
    const session = sessionStore.get(sessionId);
    const response: ChatHistoryResponse = {
      sessionId,
      messages: session.messages,
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}