import type { Request, Response, NextFunction } from "express";
import { rewardService } from "../services/rewardService";

export async function status(req: any, res: Response, next: NextFunction) {
  try {
    const out = await rewardService.status(req.userId);
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function claim(req: any, res: Response, next: NextFunction) {
  try {
    const out = await rewardService.claim(req.userId);
    res.json(out);
  } catch (e) {
    next(e);
  }
}