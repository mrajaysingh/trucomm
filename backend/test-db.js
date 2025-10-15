const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Try to connect to the database
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Try to query existing tables
    try {
      const users = await prisma.user.findMany();
      console.log('✅ Users table exists, found', users.length, 'users');
    } catch (error) {
      console.log('❌ Users table error:', error.message);
    }
    
    try {
      const plans = await prisma.plan.findMany();
      console.log('✅ Plans table exists, found', plans.length, 'plans');
    } catch (error) {
      console.log('❌ Plans table error:', error.message);
    }
    
    try {
      const coupons = await prisma.coupon.findMany();
      console.log('✅ Coupons table exists, found', coupons.length, 'coupons');
    } catch (error) {
      console.log('❌ Coupons table error:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
