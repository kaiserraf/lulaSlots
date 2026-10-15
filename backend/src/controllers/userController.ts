import type { Request, Response, NextFunction } from "express";
import { userRepository } from "../repositories/userRepository";

export async function me(req: any, res: Response, next: NextFunction) {
  try {
    const user = await userRepository.findById(req.userId);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });
    res.json({
      id: user.id,
      username: user.username,
      balance: Number(user.balance),
      lastDailyRewardAt: user.lastDailyRewardAt,
      createdAt: user.createdAt,
    });
  } catch (e) {
    next(e);
  }
}