require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function runTests() {
  console.log('--- Starting Multi-Tenant Customer Auth & Scoping Tests ---');

  try {
    // 1. Get or create two distinct sites/projects
    let siteA = await prisma.site.findFirst();
    if (!siteA) {
      console.log('No site found, creating test site A...');
      siteA = await prisma.site.create({
        data: {
          name: 'Project Alpha',
          subdomain: 'alpha-test-' + Date.now(),
          theme: 'origin',
        }
      });
    }

    let siteB = await prisma.site.findFirst({
      where: { id: { not: siteA.id } }
    });
    if (!siteB) {
      console.log('Creating test site B for multi-tenant isolation...');
      siteB = await prisma.site.create({
        data: {
          name: 'Project Beta',
          subdomain: 'beta-test-' + Date.now(),
          theme: 'nexus-pro',
        }
      });
    }

    console.log(`Site A ID: ${siteA.id} (${siteA.name})`);
    console.log(`Site B ID: ${siteB.id} (${siteB.name})`);

    const testEmail = `customer_${Date.now()}@example.com`;
    const password = 'SecurePassword123!';
    const passwordHash = await bcrypt.hash(password, 12);

    // 2. Create customer in Site A
    const customerA = await prisma.customer.create({
      data: {
        siteId: siteA.id,
        email: testEmail,
        passwordHash: passwordHash,
        firstName: 'Alice',
        lastName: 'Alpha',
        lastLoginAt: new Date(),
      }
    });
    console.log('✓ Successfully created Customer in Site A:', customerA.email, 'ID:', customerA.id);

    // 3. Create customer with SAME email in Site B (Multi-tenant uniqueness test)
    const customerB = await prisma.customer.create({
      data: {
        siteId: siteB.id,
        email: testEmail,
        passwordHash: passwordHash,
        firstName: 'Alice',
        lastName: 'Beta',
        lastLoginAt: new Date(),
      }
    });
    console.log('✓ Successfully created Customer with same email in Site B:', customerB.email, 'ID:', customerB.id);

    // 4. Verify Project Isolation
    const lookupA = await prisma.customer.findUnique({
      where: {
        siteId_email: {
          siteId: siteA.id,
          email: testEmail,
        }
      }
    });
    const lookupB = await prisma.customer.findUnique({
      where: {
        siteId_email: {
          siteId: siteB.id,
          email: testEmail,
        }
      }
    });

    if (lookupA.id === customerA.id && lookupB.id === customerB.id && lookupA.id !== lookupB.id) {
      console.log('✓ PASS: Strict Multi-Tenant Customer Isolation Verified across projects.');
    } else {
      throw new Error('FAIL: Customer isolation test failed.');
    }

    // 5. Test Password Verification
    const isMatch = await bcrypt.compare(password, lookupA.passwordHash);
    if (isMatch) {
      console.log('✓ PASS: Password hashing and comparison verified.');
    } else {
      throw new Error('FAIL: Password comparison failed.');
    }

    // 6. Test Orders Scoping
    let prodA = await prisma.product.findFirst({ where: { siteId: siteA.id } });
    if (!prodA) {
      prodA = await prisma.product.create({
        data: {
          siteId: siteA.id,
          name: 'Luxury Item A',
          slug: 'luxury-item-a-' + Date.now(),
          price: 250.00,
        }
      });
    }

    const orderA = await prisma.order.create({
      data: {
        siteId: siteA.id,
        customerId: customerA.id,
        orderNumber: `ORD-${Date.now()}-A`,
        total: 250.00,
        subtotal: 250.00,
        tax: 0.0,
        status: 'PAID',
        items: {
          create: [
            {
              productId: prodA.id,
              name: prodA.name,
              price: 250.00,
              quantity: 1,
              total: 250.00,
            }
          ]
        }
      }
    });
    console.log('✓ Created Order for Customer A in Site A:', orderA.orderNumber);

    // Customer B queries orders in Site B
    const ordersB = await prisma.order.findMany({
      where: {
        siteId: siteB.id,
        customerId: customerB.id,
      }
    });
    if (ordersB.length === 0) {
      console.log('✓ PASS: Customer B in Site B cannot see Customer A orders from Site A.');
    } else {
      throw new Error('FAIL: Order isolation test failed.');
    }

    // Customer A queries orders in Site A
    const ordersA = await prisma.order.findMany({
      where: {
        siteId: siteA.id,
        customerId: customerA.id,
      },
      include: { items: true }
    });
    if (ordersA.length === 1 && ordersA[0].id === orderA.id) {
      console.log('✓ PASS: Customer A correctly queries their own orders in Site A.');
    } else {
      throw new Error('FAIL: Customer A order query failed.');
    }

    // 7. Test Admin Customers Calculation
    const siteACustomers = await prisma.customer.findMany({
      where: { siteId: siteA.id },
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
          }
        }
      }
    });

    const enriched = siteACustomers.map(c => {
      const ordersCount = c.orders?.length || 0;
      const totalSpent = (c.orders || []).reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      return {
        id: c.id,
        name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Anonymous',
        email: c.email,
        ordersCount,
        totalSpent,
        lastLoginAt: c.lastLoginAt,
      };
    });

    const targetA = enriched.find(c => c.id === customerA.id);
    if (targetA && targetA.ordersCount === 1 && targetA.totalSpent === 250.00) {
      console.log('✓ PASS: Admin Customers aggregation (ordersCount, totalSpent, lastLoginAt) verified.');
    } else {
      throw new Error('FAIL: Admin customer enrichment failed.');
    }

    // Cleanup test records
    await prisma.orderItem.deleteMany({ where: { orderId: orderA.id } });
    await prisma.order.delete({ where: { id: orderA.id } });
    await prisma.customer.delete({ where: { id: customerA.id } });
    await prisma.customer.delete({ where: { id: customerB.id } });
    console.log('✓ Cleaned up test customers and orders.');

    console.log('\n=========================================');
    console.log('ALL CUSTOMER AUTH & ISOLATION TESTS PASSED!');
    console.log('=========================================\n');
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
