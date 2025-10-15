const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupData() {
  try {
    console.log('🔄 Starting database backup...');
    
    const backupData = {
      timestamp: new Date().toISOString(),
      users: [],
      superAdmins: [],
      superPins: [],
      plans: [],
      coupons: [],
      purchases: [],
      loginSessions: [],
      superAdminLoginSessions: []
    };

    // Backup Users
    console.log('📦 Backing up users...');
    const users = await prisma.user.findMany();
    backupData.users = users;

    // Backup Super Admins
    console.log('📦 Backing up super admins...');
    const superAdmins = await prisma.superAdmin.findMany();
    backupData.superAdmins = superAdmins;

    // Backup Super Pins
    console.log('📦 Backing up super pins...');
    const superPins = await prisma.superPin.findMany();
    backupData.superPins = superPins;

    // Backup Plans
    console.log('📦 Backing up plans...');
    const plans = await prisma.plan.findMany();
    backupData.plans = plans;

    // Backup Coupons
    console.log('📦 Backing up coupons...');
    const coupons = await prisma.coupon.findMany();
    backupData.coupons = coupons;

    // Backup Purchases
    console.log('📦 Backing up purchases...');
    const purchases = await prisma.purchase.findMany();
    backupData.purchases = purchases;

    // Backup Login Sessions
    console.log('📦 Backing up login sessions...');
    const loginSessions = await prisma.loginSession.findMany();
    backupData.loginSessions = loginSessions;

    // Backup Super Admin Login Sessions
    console.log('📦 Backing up super admin login sessions...');
    const superAdminLoginSessions = await prisma.superAdminLoginSession.findMany();
    backupData.superAdminLoginSessions = superAdminLoginSessions;

    // Save backup to file
    const backupPath = path.join(__dirname, 'backupfilefromprisma.json');
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    console.log('✅ Backup completed successfully!');
    console.log(`📁 Backup saved to: ${backupPath}`);
    console.log(`📊 Records backed up:`);
    console.log(`   - Users: ${backupData.users.length}`);
    console.log(`   - Super Admins: ${backupData.superAdmins.length}`);
    console.log(`   - Super Pins: ${backupData.superPins.length}`);
    console.log(`   - Plans: ${backupData.plans.length}`);
    console.log(`   - Coupons: ${backupData.coupons.length}`);
    console.log(`   - Purchases: ${backupData.purchases.length}`);
    console.log(`   - Login Sessions: ${backupData.loginSessions.length}`);
    console.log(`   - Super Admin Login Sessions: ${backupData.superAdminLoginSessions.length}`);

  } catch (error) {
    console.error('❌ Error during backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

backupData().catch(console.error);
