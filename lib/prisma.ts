import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const client = new PrismaClient();
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          let retries = 3;
          let delay = 1500;
          while (retries > 0) {
            try {
              return await query(args);
            } catch (error: any) {
              retries--;
              const isConnectionError = 
                error.name === 'PrismaClientInitializationError' || 
                (error.message && error.message.includes("Can't reach database server"));
                
              if (retries === 0 || !isConnectionError) throw error;
              
              console.log(`[Database] Neon sleeping, waking up... Retrying ${model}.${operation} in ${delay}ms (${retries} attempts left)`);
              await new Promise((res) => setTimeout(res, delay));
              delay += 500; // Exponential backoff slightly
            }
          }
        },
      },
    },
  });
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

// Temporary startup ping test
prisma.$queryRawUnsafe('SELECT 1')
  .then(() => console.log('[Database] Connection test SUCCESS.'))
  .catch((err: any) => {
    console.error('[Database] Connection test FAILED.', err.message);
  });
