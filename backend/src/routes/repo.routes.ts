import { Router } from "express";
import { analyzeRepo, getRouteMap } from "../controllers/repo.controller.js";

const router = Router();

router.post("/analyze", analyzeRepo);
router.get("/routes", getRouteMap);

export default router;