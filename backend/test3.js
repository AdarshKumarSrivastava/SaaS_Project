const axios = require('axios');
const jwt = require('jsonwebtoken');

// create a dummy token for a user
// Wait, I can't generate a token without knowing the user ID or DB secret.
// I can just use prisma.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
   const sites = await prisma.site.findMany();
   const site = sites[0];
   
   console.log("Original schema brandName:", site.schema.pages[0].sections[0].props.brandName);
   
   // mutate schema
   const newSchema = JSON.parse(JSON.stringify(site.schema));
   newSchema.pages[0].sections[0].props.brandName = "MODIFIED BRAND";
   
   // manually update DB like the API would
   await prisma.site.update({
      where: { id: site.id },
      data: { schema: newSchema }
   });
   
   // refetch
   const updated = await prisma.site.findUnique({ where: { id: site.id }});
   console.log("Updated schema brandName:", updated.schema.pages[0].sections[0].props.brandName);
}
run().finally(() => prisma.$disconnect());
