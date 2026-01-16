import { z } from "zod";

export const CATEGORY_NAMES = [
  "Maison & Entretien",
  "Électricité & Dépannage",
  "Livraison & Logistique",
  "Transport & Chauffeur",
  "Beauté & Bien-être",
] as const;

export const SERVICE_NAMES = [
  "Ménagère",
  "Livraison de gaz",
  "Électricien",
  "Jardinier",
  "Plombier",
  "Chauffeur privé",
  "Serrurier",
  "Menuisier",
  "Coiffure",
  "Esthéticienne",
] as const;

export type CategoryName = (typeof CATEGORY_NAMES)[number];
export type ServiceName = (typeof SERVICE_NAMES)[number];

export const RoleEnum = z.enum(["CLIENT", "ARTISAN", "ADMIN"]);
export const RequestStatusEnum = z.enum([
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
]);

export const registerSchema = z.object({
  role: RoleEnum,
  phone: z.string().min(6),
  email: z.string().email().optional().nullable(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  phoneOrEmail: z.string().min(3),
  password: z.string().min(6),
});

export const artisanProfileSchema = z.object({
  displayName: z.string().min(2),
  bio: z.string().min(10),
  categoryId: z.string().uuid(),
  serviceIds: z.array(z.string().uuid()).min(1),
  city: z.string().min(2),
  neighborhood: z.string().min(2),
  serviceAreas: z.array(z.string().min(2)).min(1),
  pricingNotes: z.string().min(2),
  isAvailableNow: z.boolean(),
  phone: z.string().min(6),
});

export const requestCreateSchema = z.object({
  artisanId: z.string().uuid(),
  serviceId: z.string().uuid(),
  city: z.string().min(2),
  neighborhood: z.string().min(2),
  addressText: z.string().min(5),
  desiredAt: z.string().datetime(),
  detailsText: z.string().min(5),
});

export const reviewCreateSchema = z.object({
  requestId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(2),
});

export const requestStatusUpdateSchema = z.object({
  status: RequestStatusEnum,
});

export const availabilitySchema = z.object({
  isAvailableNow: z.boolean(),
});

export const artisanFilterSchema = z.object({
  categoryId: z.string().uuid().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  minRating: z.string().optional(),
  availableNow: z.string().optional(),
  serviceId: z.string().uuid().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ArtisanProfileInput = z.infer<typeof artisanProfileSchema>;
export type RequestCreateInput = z.infer<typeof requestCreateSchema>;
export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
