import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface AuthPayload {
  userId: string;
  role: "CLIENT" | "ARTISAN" | "ADMIN";
}

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next({ status: 401, message: "Missing authorization" });
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;
    req.user = decoded;
    return next();
  } catch {
    return next({ status: 401, message: "Invalid token" });
  }
};

export const requireRole = (...roles: AuthPayload["role"][]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next({ status: 403, message: "Access denied" });
    }
    return next();
  };
