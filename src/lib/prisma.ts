// =========================================
// Prisma Client — Singleton для Next.js
// =========================================
//
// В режиме разработки Next.js перезагружает модули при каждом HMR-обновлении.
// Без singleton каждый hot-reload создаёт новый PrismaClient, что быстро
// исчерпывает пул соединений PostgreSQL (обычно 20 по умолчанию).
//
// Решение: храним единственный экземпляр PrismaClient в globalThis,
// который не сбрасывается при HMR.
// =========================================

import { PrismaClient } from "@prisma/client";

// Расширяем глобальный тип, чтобы TypeScript знал о нашем поле
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// В production создаём новый клиент; в development переиспользуем из globalThis
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Сохраняем в globalThis только в development,
// чтобы HMR не создавал новые подключения
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
