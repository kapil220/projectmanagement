import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Singleton pattern for ALL environments.
// In Next.js API routes each request can spin up a new module instance,
// leading to multiple PrismaClient instances and "prepared statement already exists"
// errors with connection poolers (PgBouncer / Supabase pooler).
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

export const prisma: PrismaClient =
  global.prisma ?? prismaClientSingleton();

// Always cache on global — prevents multiple instances across hot-reloads in dev
// and across multiple API route invocations in production.
if (!global.prisma) {
  global.prisma = prisma;
}
