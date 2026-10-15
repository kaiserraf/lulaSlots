import { Router } from "express";
import { me } from "../controllers/userController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
router.use(authMiddleware);
router.get("/me", me);

export default router;