import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: { status?: number; message?: string; details?: unknown },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.status ?? 500;
  return res.status(status).json({
    error: err.message ?? "Internal server error",
    details: err.details,
  });
};
