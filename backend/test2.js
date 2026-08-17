const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sites = await prisma.site.findMany();
  for (const site of sites) {
     console.log(`Site: ${site.id} / ${site.name}`);
     console.log(JSON.stringify(site.schema, null, 2));
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
