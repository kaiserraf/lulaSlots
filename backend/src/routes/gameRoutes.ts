import { Router } from "express";
import { gameValidators, spin, history, stats } from "../controllers/gameController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
router.use(authMiddleware);

router.post("/spin", gameValidators.spin, spin);
router.get("/history", history);
router.get("/stats", stats);

export default router;