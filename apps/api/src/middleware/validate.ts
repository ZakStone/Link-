import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate = (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next({ status: 400, message: "Validation error", details: result.error.flatten() });
    }
    req.body = result.data;
    return next();
  };
