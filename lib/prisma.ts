import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Auto-append pgbouncer=true so prepared statements are disabled.
// connect_timeout=10 makes connections fail fast (10s) instead of hanging forever.
// This fixes "42P05 prepared statement already exists" with connection
// poolers (Supabase, PgBouncer) — no server env changes required.
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL || '';
  if (url.includes('pgbouncer=true')) return url; // already fully configured
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}pgbouncer=true&connection_limit=1&connect_timeout=10&pool_timeout=10`;
};

const createPrismaClient = () =>
  new PrismaClient({
    datasources: { db: { url: getDatabaseUrl() } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

export const prisma: PrismaClient = global.prisma ?? createPrismaClient();

// Cache globally to prevent multiple instances across hot-reloads and API routes
if (!global.prisma) {
  global.prisma = prisma;
}
