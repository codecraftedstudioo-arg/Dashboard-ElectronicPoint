import { PrismaClient } from "@prisma/client";

// Replace a dev client created before `quotePricingRevision` existed on the generated client.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const cached = globalForPrisma.prisma;
const cachedHasQuoteRevisions =
  cached !== undefined &&
  typeof (cached as PrismaClient & { quotePricingRevision?: { findMany?: unknown } })
    .quotePricingRevision?.findMany === "function";

export const prisma =
  cached && cachedHasQuoteRevisions
    ? cached
    : new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
