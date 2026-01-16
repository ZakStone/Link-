import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { prisma } from "../prisma";
import { reviewCreateSchema } from "@link/shared";
import { validate } from "../middleware/validate";

const router = Router();

router.post(
  "/",
  authenticate,
  requireRole("CLIENT"),
  validate(reviewCreateSchema),
  async (req, res, next) => {
    try {
      const { requestId, rating, comment } = req.body;
      const request = await prisma.request.findUnique({
        where: { id: requestId },
        include: { artisan: true },
      });
      if (!request || request.clientId !== req.user!.userId) {
        return res.status(404).json({ error: "Request not found" });
      }
      if (request.status !== "COMPLETED") {
        return res.status(400).json({ error: "Request not completed" });
      }
      const existing = await prisma.review.findUnique({ where: { requestId } });
      if (existing) {
        return res.status(409).json({ error: "Review already exists" });
      }

      const review = await prisma.review.create({
        data: {
          requestId,
          rating,
          comment,
          artisanId: request.artisanId,
        },
      });

      const artisan = await prisma.artisanProfile.findUnique({ where: { id: request.artisanId } });
      if (artisan) {
        const newCount = artisan.ratingCount + 1;
        const newAvg = (artisan.ratingAvg * artisan.ratingCount + rating) / newCount;
        await prisma.artisanProfile.update({
          where: { id: artisan.id },
          data: { ratingAvg: newAvg, ratingCount: newCount },
        });
      }

      return res.status(201).json(review);
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
