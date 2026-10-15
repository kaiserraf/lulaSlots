import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validate =
  (schema: z.ZodSchema, target: "body" | "query" | "params" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(result.error);
    }
    (req as any)[target] = result.data;
    next();
  };