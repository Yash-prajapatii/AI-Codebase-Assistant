import cors from "cors";
import { config } from "../config/index.js";

export const corsMiddleware = cors({
  origin: config.CORS_ORIGIN,
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});