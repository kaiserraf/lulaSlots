import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { gameService } from "../services/gameService";
import { validate } from "../middlewares/validate";

const spinSchema = z.object({
  betAmount: z.number().int(),
});

export const gameValidators = {
  spin: validate(spinSchema),
};

export async function spin(req: any, res: Response, next: NextFunction) {
  try {
    const out = await gameService.spin(req.userId, req.body.betAmount);
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function history(req: any, res: Response, next: NextFunction) {
  try {
    const out = await gameService.history(req.userId);
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function stats(req: any, res: Response, next: NextFunction) {
  try {
    const out = await gameService.stats(req.userId);
    res.json(out);
  } catch (e) {
    next(e);
  }
}