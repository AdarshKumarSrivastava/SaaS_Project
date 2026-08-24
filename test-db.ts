import { config } from 'dotenv';
config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log("Testing with DATABASE_URL:", process.env.DATABASE_URL?.substring(0, 30) + "...");
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("DATABASE CONNECTION SUCCESSFUL!");
  } catch (err) {
    console.error("DATABASE CONNECTION FAILED:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
