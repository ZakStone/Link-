import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/categories", async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: { services: true },
      orderBy: { name: "asc" },
    });
    return res.json(categories);
  } catch (error) {
    return next(error);
  }
});

router.get("/services", async (_req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      include: { category: true },
      orderBy: { name: "asc" },
    });
    return res.json(services);
  } catch (error) {
    return next(error);
  }
});

export default router;
