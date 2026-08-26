import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fix() {
  const sites = await prisma.site.findMany({
    where: { 
      // We can apply this to all sites, because extracting defaults from their current state would be tricky.
      // But actually, just finding the Origin site that's corrupted is safest.
      // The user mentioned a site that displays "My Origin"
    }
  });

  for (const site of sites) {
    const currentSchema: any = site.schema;
    if (!currentSchema) continue;

    // Only clean sites that have Origin as their template but have Velocity content
    if (currentSchema?.global?.templateSlug === 'origin' && currentSchema?.pages) {
       console.log('Found Origin site, cleaning up its schema to restore canonical defaults:', site.id);
       delete currentSchema.pages;
       
       await prisma.site.update({
         where: { id: site.id },
         data: { schema: currentSchema }
       });
    }
  }

  console.log('Done!');
}

fix().catch(console.error).finally(() => prisma.$disconnect());
