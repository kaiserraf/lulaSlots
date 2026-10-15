import { Router } from "express";
import { authValidators, register, login, me } from "../controllers/authController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.post("/register", authValidators.register, register);
router.post("/login", authValidators.login, login);
router.get("/me", authMiddleware, me);

export default router;