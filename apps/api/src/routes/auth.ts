import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { prisma } from "../prisma";
import { config } from "../config";
import { loginSchema, registerSchema } from "@link/shared";
import { validate } from "../middleware/validate";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const signAccessToken = (payload: { userId: string; role: string }) =>
  jwt.sign(payload, config.jwtSecret, { expiresIn: config.accessTokenTtl });

const signRefreshToken = (payload: { userId: string; role: string }) =>
  jwt.sign(payload, config.refreshSecret, { expiresIn: config.refreshTokenTtl });

router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { phone, email, password, role } = req.body;
    if (role === "ADMIN") {
      return res.status(403).json({ error: "Admin registration disabled" });
    }
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ phone }, email ? { email } : undefined].filter(Boolean) as any,
      },
    });
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        phone,
        email,
        role,
        passwordHash,
      },
    });
    return res.status(201).json({ id: user.id, phone: user.phone, role: user.role });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", loginLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { phoneOrEmail, password } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ phone: phoneOrEmail }, { email: phoneOrEmail }],
      },
    });
    if (!user || user.isBanned) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
      },
    });

    return res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, role: user.role, phone: user.phone },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Missing refresh token" });
    }
    const stored = await prisma.refreshToken.findFirst({
      where: { token: refreshToken, revoked: false },
      include: { user: true },
    });
    if (!stored || stored.user.isBanned) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }
    const decoded = jwt.verify(refreshToken, config.refreshSecret) as { userId: string; role: string };
    const accessToken = signAccessToken({ userId: decoded.userId, role: decoded.role });
    return res.json({ accessToken });
  } catch (error) {
    return next({ status: 401, message: "Invalid refresh token" });
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Missing refresh token" });
    }
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true },
    });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
