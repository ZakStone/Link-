import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate, requireRole } from "../middleware/auth";
import {
  artisanFilterSchema,
  artisanProfileSchema,
  availabilitySchema,
} from "@link/shared";
import { validate } from "../middleware/validate";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const parsed = artisanFilterSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid filters" });
    }
    const { categoryId, city, neighborhood, minRating, availableNow, serviceId } = parsed.data;
    const filters: any = {
      ...(categoryId ? { categoryId } : {}),
      ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
      ...(neighborhood ? { neighborhood: { equals: neighborhood, mode: "insensitive" } } : {}),
      ...(availableNow ? { isAvailableNow: availableNow === "true" } : {}),
      ...(minRating ? { ratingAvg: { gte: Number(minRating) } } : {}),
    };

    const artisans = await prisma.artisanProfile.findMany({
      where: {
        ...filters,
        ...(serviceId
          ? {
              services: { some: { serviceId } },
            }
          : {}),
        user: { isBanned: false },
      },
      include: {
        services: { include: { service: true } },
        category: true,
      },
      orderBy: { ratingAvg: "desc" },
    });

    return res.json(artisans);
  } catch (error) {
    return next(error);
  }
});

router.get("/me/profile", authenticate, requireRole("ARTISAN"), async (req, res, next) => {
  try {
    const profile = await prisma.artisanProfile.findUnique({
      where: { userId: req.user!.userId },
      include: { services: { include: { service: true } }, category: true },
    });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    return res.json(profile);
  } catch (error) {
    return next(error);
  }
});

router.post(
  "/me/profile",
  authenticate,
  requireRole("ARTISAN"),
  validate(artisanProfileSchema),
  async (req, res, next) => {
    try {
      const existing = await prisma.artisanProfile.findUnique({
        where: { userId: req.user!.userId },
      });
      if (existing) {
        return res.status(409).json({ error: "Profile already exists" });
      }

      const data = req.body;
      const profile = await prisma.artisanProfile.create({
        data: {
          userId: req.user!.userId,
          displayName: data.displayName,
          bio: data.bio,
          categoryId: data.categoryId,
          city: data.city,
          neighborhood: data.neighborhood,
          serviceAreas: data.serviceAreas,
          pricingNotes: data.pricingNotes,
          isAvailableNow: data.isAvailableNow,
          phone: data.phone,
          services: {
            create: data.serviceIds.map((serviceId: string) => ({ serviceId })),
          },
        },
        include: { services: { include: { service: true } }, category: true },
      });
      return res.status(201).json(profile);
    } catch (error) {
      return next(error);
    }
  }
);

router.put(
  "/me/profile",
  authenticate,
  requireRole("ARTISAN"),
  validate(artisanProfileSchema),
  async (req, res, next) => {
    try {
      const data = req.body;
      const profile = await prisma.artisanProfile.update({
        where: { userId: req.user!.userId },
        data: {
          displayName: data.displayName,
          bio: data.bio,
          categoryId: data.categoryId,
          city: data.city,
          neighborhood: data.neighborhood,
          serviceAreas: data.serviceAreas,
          pricingNotes: data.pricingNotes,
          isAvailableNow: data.isAvailableNow,
          phone: data.phone,
          services: {
            deleteMany: {},
            create: data.serviceIds.map((serviceId: string) => ({ serviceId })),
          },
        },
        include: { services: { include: { service: true } }, category: true },
      });
      return res.json(profile);
    } catch (error) {
      return next(error);
    }
  }
);

router.patch(
  "/me/availability",
  authenticate,
  requireRole("ARTISAN"),
  validate(availabilitySchema),
  async (req, res, next) => {
    try {
      const profile = await prisma.artisanProfile.update({
        where: { userId: req.user!.userId },
        data: { isAvailableNow: req.body.isAvailableNow },
      });
      return res.json(profile);
    } catch (error) {
      return next(error);
    }
  }
);

router.get("/:id", async (req, res, next) => {
  try {
    const artisan = await prisma.artisanProfile.findUnique({
      where: { id: req.params.id },
      include: {
        services: { include: { service: true } },
        category: true,
        reviews: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!artisan) {
      return res.status(404).json({ error: "Artisan not found" });
    }
    return res.json(artisan);
  } catch (error) {
    return next(error);
  }
});

export default router;
