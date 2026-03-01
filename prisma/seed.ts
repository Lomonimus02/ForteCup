// =========================================
// Prisma Seed — начальные B2B данные для БД
// =========================================
// Запуск: npx prisma db seed
// Или:    npx tsx prisma/seed.ts
//
// B2B опт упаковки: цены за штуку и коробку.
// Idempotent: удаляет и пересоздаёт данные.
// =========================================

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Очистка (порядок важен из-за FK) ──
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // ── Admin User ──
  const adminPasswordHash = await hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@fortecup.ru" },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: "admin@fortecup.ru",
      passwordHash: adminPasswordHash,
      name: "Admin",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created (admin@fortecup.ru / admin123)");

  // ── Категории (дерево) ──
  const doubleWall = await prisma.category.create({
    data: { name: "Двухслойные стаканы", slug: "double-wall" },
  });

  const singleWall = await prisma.category.create({
    data: { name: "Однослойные стаканы", slug: "single-wall" },
  });

  const coldDrinks = await prisma.category.create({
    data: { name: "Холодные напитки (PET)", slug: "cold-drinks" },
  });

  const accessories = await prisma.category.create({
    data: { name: "Аксессуары", slug: "accessories" },
  });

  // Подкатегории
  const lids = await prisma.category.create({
    data: { name: "Крышки", slug: "lids", parentId: accessories.id },
  });

  const holders = await prisma.category.create({
    data: { name: "Холдеры", slug: "holders", parentId: accessories.id },
  });

  console.log("✅ Categories created (with subcategories)");

  // ── Товары + B2B Варианты ──

  // 1. Blackout Double — двухслойный стакан
  await prisma.product.create({
    data: {
      name: "Blackout Double",
      slug: "blackout-double",
      description:
        "Двухслойный чёрный стакан. Не обжигает руки, не нуждается в холдере. Идеален для горячего капучино и латте.",
      imageBaseUrl:
        "https://images.unsplash.com/photo-1572119865084-43c285814d63?q=80&w=2070&auto=format&fit=crop",
      isPopular: true,
      categoryId: doubleWall.id,
      variants: {
        create: [
          {
            sku: "DW-165-BLK",
            volume: "165 мл",
            colorOrDesign: "Чёрный",
            pricePerPiece: 2.5,
            piecesPerBox: 1400,
            boxPrice: 3500,
            inStock: true,
          },
          {
            sku: "DW-250-BLK",
            volume: "250 мл",
            colorOrDesign: "Чёрный",
            pricePerPiece: 3.0,
            piecesPerBox: 1000,
            boxPrice: 3000,
            inStock: true,
          },
          {
            sku: "DW-350-BLK",
            volume: "350 мл",
            colorOrDesign: "Чёрный",
            pricePerPiece: 4.0,
            piecesPerBox: 700,
            boxPrice: 2800,
            inStock: true,
          },
        ],
      },
    },
  });

  // 2. Kraft Single — однослойный стакан
  await prisma.product.create({
    data: {
      name: "Kraft Single",
      slug: "kraft-single",
      description:
        "Однослойный крафтовый стакан из эко-картона. Биоразлагаемый, с ламинацией для горячих напитков.",
      imageBaseUrl:
        "https://images.unsplash.com/photo-1534687941688-651ccaafbff8?q=80&w=2070&auto=format&fit=crop",
      isPopular: false,
      categoryId: singleWall.id,
      variants: {
        create: [
          {
            sku: "SW-250-KRF",
            volume: "250 мл",
            colorOrDesign: "Крафт",
            pricePerPiece: 1.8,
            piecesPerBox: 2000,
            boxPrice: 3600,
            inStock: true,
          },
          {
            sku: "SW-350-KRF",
            volume: "350 мл",
            colorOrDesign: "Крафт",
            pricePerPiece: 2.2,
            piecesPerBox: 1500,
            boxPrice: 3300,
            inStock: true,
          },
        ],
      },
    },
  });

  // 3. Gentleman Cup — дизайнерский двухслойный
  await prisma.product.create({
    data: {
      name: "Gentleman Cup",
      slug: "gentleman-cup",
      description:
        "Стакан с дизайном «Джентельмен». Двухслойный, премиальное качество печати.",
      imageBaseUrl:
        "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?q=80&w=2070&auto=format&fit=crop",
      isPopular: true,
      categoryId: doubleWall.id,
      variants: {
        create: [
          {
            sku: "DW-165-GENT",
            volume: "165 мл",
            colorOrDesign: "Джентельмен",
            pricePerPiece: 2.0,
            piecesPerBox: 3000,
            boxPrice: 6000,
            inStock: true,
          },
          {
            sku: "DW-250-GENT",
            volume: "250 мл",
            colorOrDesign: "Джентельмен",
            pricePerPiece: 2.5,
            piecesPerBox: 2000,
            boxPrice: 5000,
            inStock: false,
          },
        ],
      },
    },
  });

  // 4. Clear PET Cup
  await prisma.product.create({
    data: {
      name: "Clear PET Cup",
      slug: "clear-pet-cup",
      description:
        "Прозрачный PET-стакан для холодных напитков: айс-латте, смузи, лимонады.",
      imageBaseUrl:
        "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?q=80&w=2070&auto=format&fit=crop",
      isPopular: true,
      categoryId: coldDrinks.id,
      variants: {
        create: [
          {
            sku: "PET-300-CLR",
            volume: "300 мл",
            colorOrDesign: "Прозрачный",
            pricePerPiece: 1.5,
            piecesPerBox: 2500,
            boxPrice: 3750,
            inStock: true,
          },
          {
            sku: "PET-500-CLR",
            volume: "500 мл",
            colorOrDesign: "Прозрачный",
            pricePerPiece: 2.0,
            piecesPerBox: 1500,
            boxPrice: 3000,
            inStock: true,
          },
        ],
      },
    },
  });

  // 5. Neon Yellow Lids — крышки
  await prisma.product.create({
    data: {
      name: "Крышки неоново-жёлтые",
      slug: "neon-yellow-lids",
      description: "Яркие неоново-жёлтые крышки для стаканов 80 мм.",
      imageBaseUrl:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop",
      isPopular: false,
      categoryId: lids.id,
      variants: {
        create: [
          {
            sku: "LID-80-YLW",
            volume: null,
            colorOrDesign: "Жёлтый неон",
            pricePerPiece: 0.5,
            piecesPerBox: 5000,
            boxPrice: 2500,
            inStock: true,
          },
        ],
      },
    },
  });

  // 6. Classic White Lids
  await prisma.product.create({
    data: {
      name: "Крышки белые",
      slug: "classic-white-lids",
      description: "Классические белые крышки для горячих стаканов 80–90 мм.",
      imageBaseUrl:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop",
      isPopular: false,
      categoryId: lids.id,
      variants: {
        create: [
          {
            sku: "LID-80-WHT",
            volume: null,
            colorOrDesign: "Белый",
            pricePerPiece: 0.4,
            piecesPerBox: 5000,
            boxPrice: 2000,
            inStock: true,
          },
          {
            sku: "LID-90-WHT",
            volume: null,
            colorOrDesign: "Белый 90мм",
            pricePerPiece: 0.5,
            piecesPerBox: 4000,
            boxPrice: 2000,
            inStock: true,
          },
        ],
      },
    },
  });

  // 7. Ripple Wall — гофрированный стакан
  await prisma.product.create({
    data: {
      name: "Ripple Wall",
      slug: "ripple-wall",
      description: "Гофрированный стакан с рифлёной стенкой. Отличная термоизоляция без холдера.",
      imageBaseUrl:
        "https://images.unsplash.com/photo-1572119865084-43c285814d63?q=80&w=2070&auto=format&fit=crop",
      isPopular: true,
      categoryId: doubleWall.id,
      variants: {
        create: [
          {
            sku: "RW-250-BRN",
            volume: "250 мл",
            colorOrDesign: "Коричневый",
            pricePerPiece: 3.5,
            piecesPerBox: 800,
            boxPrice: 2800,
            inStock: true,
          },
          {
            sku: "RW-350-BRN",
            volume: "350 мл",
            colorOrDesign: "Коричневый",
            pricePerPiece: 4.5,
            piecesPerBox: 600,
            boxPrice: 2700,
            inStock: true,
          },
        ],
      },
    },
  });

  // 8. Картонный холдер
  await prisma.product.create({
    data: {
      name: "Картонный холдер",
      slug: "cardboard-holder",
      description: "Упаковочный холдер для однослойных стаканов. Защита от ожогов.",
      imageBaseUrl:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop",
      isPopular: false,
      categoryId: holders.id,
      variants: {
        create: [
          {
            sku: "HOLD-KRF",
            volume: null,
            colorOrDesign: "Крафт",
            pricePerPiece: 0.8,
            piecesPerBox: 3000,
            boxPrice: 2400,
            inStock: true,
          },
        ],
      },
    },
  });

  console.log("✅ Products & B2B variants created");
  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
