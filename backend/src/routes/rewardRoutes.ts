import { Router } from "express";
import { status, claim } from "../controllers/rewardController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
router.use(authMiddleware);

router.get("/daily", status);
router.post("/daily/claim", claim);

export default router;