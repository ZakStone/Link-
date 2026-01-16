import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { prisma } from "../prisma";
import { requestCreateSchema, requestStatusUpdateSchema } from "@link/shared";
import { validate } from "../middleware/validate";

const router = Router();

router.post(
  "/",
  authenticate,
  requireRole("CLIENT"),
  validate(requestCreateSchema),
  async (req, res, next) => {
    try {
      const data = req.body;
      const artisan = await prisma.artisanProfile.findUnique({ where: { id: data.artisanId } });
      if (!artisan) {
        return res.status(404).json({ error: "Artisan not found" });
      }
      const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      const request = await prisma.request.create({
        data: {
          clientId: req.user!.userId,
          artisanId: data.artisanId,
          serviceId: data.serviceId,
          city: data.city,
          neighborhood: data.neighborhood,
          addressText: data.addressText,
          desiredAt: new Date(data.desiredAt),
          detailsText: data.detailsText,
        },
        include: { artisan: true, service: true },
      });
      return res.status(201).json(request);
    } catch (error) {
      return next(error);
    }
  }
);

router.get("/my", authenticate, requireRole("CLIENT"), async (req, res, next) => {
  try {
    const requests = await prisma.request.findMany({
      where: { clientId: req.user!.userId },
      include: { artisan: true, service: true, review: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(requests);
  } catch (error) {
    return next(error);
  }
});

router.get("/assigned", authenticate, requireRole("ARTISAN"), async (req, res, next) => {
  try {
    const profile = await prisma.artisanProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    const requests = await prisma.request.findMany({
      where: { artisanId: profile.id },
      include: { client: true, service: true, review: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(requests);
  } catch (error) {
    return next(error);
  }
});

router.patch(
  "/:id/status",
  authenticate,
  validate(requestStatusUpdateSchema),
  async (req, res, next) => {
    try {
      const { status } = req.body;
      const request = await prisma.request.findUnique({ where: { id: req.params.id } });
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      if (req.user!.role === "ARTISAN") {
        const profile = await prisma.artisanProfile.findUnique({ where: { userId: req.user!.userId } });
        if (!profile || request.artisanId !== profile.id) {
          return res.status(403).json({ error: "Not allowed" });
        }
      } else if (req.user!.role === "CLIENT") {
        if (request.clientId !== req.user!.userId || status !== "CANCELLED") {
          return res.status(403).json({ error: "Not allowed" });
        }
      } else {
        return res.status(403).json({ error: "Not allowed" });
      }

      const updated = await prisma.request.update({
        where: { id: req.params.id },
        data: { status },
      });
      return res.json(updated);
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
