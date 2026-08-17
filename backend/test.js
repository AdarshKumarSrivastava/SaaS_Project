const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sites = await prisma.site.findMany();
  if (sites.length > 0) {
    console.log(JSON.stringify(sites[0].schema, null, 2));
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
