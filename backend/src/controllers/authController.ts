import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authService } from "../services/authService";
import { validate } from "../middlewares/validate";

const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Apenas letras, números e underscore."),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const authValidators = {
  register: validate(registerSchema),
  login: validate(loginSchema),
};

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;
    const out = await authService.register(username, password);
    res.status(201).json(out);
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;
    const out = await authService.login(username, password);
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function me(req: any, res: Response, next: NextFunction) {
  try {
    const out = await authService.me(req.userId);
    res.json(out);
  } catch (e) {
    next(e);
  }
}