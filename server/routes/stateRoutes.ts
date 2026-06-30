import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { getState, updateState } from "../controllers/stateController";

const router = Router();

// All routes are protected and use the authenticated user id
router.get("/", protect, getState);
router.post("/", protect, updateState);

export default router;
