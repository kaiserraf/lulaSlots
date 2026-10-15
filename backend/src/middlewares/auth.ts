import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { HttpError } from "./errorHandler";
import { prisma } from "../config/prisma";

export interface AuthRequest extends Request {
  userId?: string;
}

export async function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new HttpError(401, "Token de autenticação ausente."));
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true } });
    if (!user) throw new HttpError(401, "Usuário não encontrado.");
    req.userId = payload.userId;
    next();
  } catch {
    next(new HttpError(401, "Token inválido ou expirado."));
  }
}