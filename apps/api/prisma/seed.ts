import { PrismaClient } from "@prisma/client";
import { CATEGORY_NAMES, SERVICE_NAMES } from "@link/shared";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const CATEGORY_SERVICE_MAP: Record<string, string[]> = {
  "Maison & Entretien": ["Ménagère", "Jardinier", "Plombier", "Serrurier", "Menuisier"],
  "Électricité & Dépannage": ["Électricien"],
  "Livraison & Logistique": ["Livraison de gaz"],
  "Transport & Chauffeur": ["Chauffeur privé"],
  "Beauté & Bien-être": ["Coiffure", "Esthéticienne"],
};

const CITIES = ["Dakar", "Abidjan", "Cotonou", "Lomé", "Douala"];
const NEIGHBORHOODS = ["Centre", "Nord", "Sud", "Plateau", "Riviera"];

const sampleBio = (service: string) =>
  `Professionnel(le) ${service} avec plusieurs années d'expérience. Service rapide et fiable.`;

async function main() {
  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
    for (const name of CATEGORY_NAMES) {
      await prisma.category.create({ data: { name } });
    }
  }

  const categoryMap = await prisma.category.findMany();
  const servicesExisting = await prisma.service.findMany();

  if (servicesExisting.length === 0) {
    for (const name of SERVICE_NAMES) {
      const categoryName = Object.keys(CATEGORY_SERVICE_MAP).find((key) =>
        CATEGORY_SERVICE_MAP[key].includes(name)
      );
      const category = categoryMap.find((item) => item.name === categoryName);
      if (!category) continue;
      await prisma.service.create({
        data: {
          name,
          categoryId: category.id,
        },
      });
    }
  }

  const adminPhone = "+221700000000";
  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {},
    create: {
      phone: adminPhone,
      email: "admin@link.local",
      role: "ADMIN",
      passwordHash: await bcrypt.hash("admin123", 10),
    },
  });

  const serviceList = await prisma.service.findMany({ include: { category: true } });

  const existingArtisans = await prisma.artisanProfile.findMany();
  if (existingArtisans.length === 0) {
    for (let i = 0; i < 20; i += 1) {
      const service = serviceList[i % serviceList.length];
      const city = CITIES[i % CITIES.length];
      const neighborhood = NEIGHBORHOODS[i % NEIGHBORHOODS.length];
      const phone = `+2217800000${i}`;
      const user = await prisma.user.create({
        data: {
          phone,
          email: `artisan${i}@link.local`,
          role: "ARTISAN",
          passwordHash: await bcrypt.hash("artisan123", 10),
        },
      });

      const profile = await prisma.artisanProfile.create({
        data: {
          userId: user.id,
          displayName: `Artisan ${service.name} ${i + 1}`,
          bio: sampleBio(service.name),
          categoryId: service.categoryId,
          city,
          neighborhood,
          serviceAreas: [city, neighborhood],
          pricingNotes: "Tarifs à partir de 5 000 FCFA.",
          isAvailableNow: i % 2 === 0,
          phone,
        },
      });

      await prisma.artisanService.create({
        data: {
          artisanId: profile.id,
          serviceId: service.id,
        },
      });
    }
  }

  const clientPhone = "+221711111111";
  await prisma.user.upsert({
    where: { phone: clientPhone },
    update: {},
    create: {
      phone: clientPhone,
      email: "client@link.local",
      role: "CLIENT",
      passwordHash: await bcrypt.hash("client123", 10),
    },
  });

  console.log("Seed completed", { admin: admin.phone });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
