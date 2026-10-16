import { PrismaClient } from "@prisma/client";

// Replace a dev client created before later schema fields existed.
const CLIENT_REVISION = "opportunity";
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaRevision: string | undefined;
};

const cached = globalForPrisma.prisma;
const cachedIsCurrent =
  cached !== undefined &&
  globalForPrisma.prismaRevision === CLIENT_REVISION &&
  typeof (cached as PrismaClient & { quotePricingRevision?: { findMany?: unknown } })
    .quotePricingRevision?.findMany === "function";

if (cached && !cachedIsCurrent) {
  void cached.$disconnect().catch(() => {});
}

export const prisma: PrismaClient =
  cached !== undefined && cachedIsCurrent
    ? cached
    : new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaRevision = CLIENT_REVISION;
}
