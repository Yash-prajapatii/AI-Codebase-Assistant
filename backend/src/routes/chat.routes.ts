import { Router } from "express";
import { chat, getChatHistory } from "../controllers/chat.controller.js";

const router = Router();

router.post("/", chat);
router.get("/history/:sessionId", getChatHistory);

export default router;