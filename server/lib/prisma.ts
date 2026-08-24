import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// Safe startup diagnostics
if (!globalForPrisma.prisma) {
  const dbUrl = process.env.DATABASE_URL || '';
  try {
    if (dbUrl) {
      const url = new URL(dbUrl);
      console.log(`[Database] Initializing Prisma with host: ${url.hostname}, port: ${url.port || '5432'}`);
    } else {
      console.error('[Database] WARNING: DATABASE_URL is not set!');
    }
  } catch (e) {
    console.error('[Database] WARNING: DATABASE_URL is invalid or malformed.');
  }
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
