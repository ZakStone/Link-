import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { prisma } from "../prisma";

const router = Router();

router.get("/users", authenticate, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      include: { artisan: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(users);
  } catch (error) {
    return next(error);
  }
});

router.patch("/users/:id/ban", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { isBanned } = req.body;
    if (typeof isBanned !== "boolean") {
      return res.status(400).json({ error: "isBanned must be boolean" });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isBanned },
    });
    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

export default router;
