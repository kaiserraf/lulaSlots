import type { Request, Response, NextFunction } from "express";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err?.name === "ZodError") {
    return res.status(400).json({ error: "Dados inválidos.", details: err.flatten?.() });
  }
  console.error("Erro não tratado:", err);
  return res.status(500).json({ error: "Erro interno do servidor." });
}