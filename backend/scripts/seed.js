const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create plans
  const xcommPlan = await prisma.plan.upsert({
    where: { id: 'xcomm' },
    update: {},
    create: {
      id: 'xcomm',
      name: 'XComm',
      type: 'BASIC',
      description: 'Perfect for individuals and small teams starting their secure communication journey.',
      price: 5,
      features: [
        '10GB Data Center Storage',
        'RC4 & RSA Encryption',
        'Logs Control',
        'EEE Security',
        'Main Support'
      ],
      duration: 1
    }
  });

  const xcommProPlan = await prisma.plan.upsert({
    where: { id: 'xcomm-pro' },
    update: {},
    create: {
      id: 'xcomm-pro',
      name: 'XComm Pro',
      type: 'PROFESSIONAL',
      description: 'Advanced security features for growing businesses and professional teams.',
      price: 15,
      features: [
        '100GB Data Center Storage',
        'AES-256 & ECC Encryption (military-grade)',
        'Advanced Logs Control with export options',
        'EEE+ Security (enhanced enterprise-grade)',
        'Priority Support (24/7 Email & Chat)'
      ],
      duration: 1
    }
  });

  const xcommElitePlan = await prisma.plan.upsert({
    where: { id: 'xcomm-elite' },
    update: {},
    create: {
      id: 'xcomm-elite',
      name: 'XComm Elite',
      type: 'ENTERPRISE',
      description: 'Ultimate security suite with BYOSS technology for enterprise-level protection.',
      price: 30,
      features: [
        'Loaded With BYOSS Tech',
        '1TB Data Center Storage',
        'Hybrid Post-Quantum Encryption',
        'Full Logs Control with Monitoring & Alerts',
        'Zero-Trust EEE Security Suite',
        'Dedicated Account Manager + VIP Support'
      ],
      duration: 1
    }
  });

  // Create sample coupons
  const welcomeCoupon = await prisma.coupon.upsert({
    where: { code: 'WELCOME20' },
    update: {},
    create: {
      code: 'WELCOME20',
      description: 'Welcome discount for new customers',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minAmount: 500,
      maxDiscount: 1000,
      usageLimit: 100,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  });

  const earlyBirdCoupon = await prisma.coupon.upsert({
    where: { code: 'EARLYBIRD' },
    update: {},
    create: {
      code: 'EARLYBIRD',
      description: 'Early bird special offer',
      discountType: 'FIXED',
      discountValue: 500,
      minAmount: 2000,
      usageLimit: 50,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days
    }
  });

  const startupCoupon = await prisma.coupon.upsert({
    where: { code: 'STARTUP50' },
    update: {},
    create: {
      code: 'STARTUP50',
      description: 'Special discount for startups',
      discountType: 'PERCENTAGE',
      discountValue: 50,
      minAmount: 1000,
      maxDiscount: 2000,
      usageLimit: 25,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
    }
  });

  // Create super admin user
  const superAdminPassword = await bcrypt.hash('admin123', 12);
  const superAdmin = await prisma.superAdmin.upsert({
    where: { softwareLoginEmail: 'admin@trucomm.com' },
    update: {},
    create: {
      username: 'superadmin',
      email: 'admin@trucomm.com',
      workEmail: 'admin@trucomm.com',
      softwareLoginEmail: 'admin@trucomm.com',
      password: superAdminPassword,
      isActive: true
    }
  });

  // Create sample users for testing
  const sampleUsers = [
    {
      username: 'ceo_user',
      email: 'ceo@trucomm.com',
      workEmail: 'ceo@trucomm.com',
      softwareLoginEmail: 'ceo@trucomm.com',
      password: await bcrypt.hash('ceo123', 12),
      designation: 'CEO'
    },
    {
      username: 'hr_manager',
      email: 'hr@trucomm.com',
      workEmail: 'hr@trucomm.com',
      softwareLoginEmail: 'hr@trucomm.com',
      password: await bcrypt.hash('hr123', 12),
      designation: 'HR'
    },
    {
      username: 'employee1',
      email: 'employee1@trucomm.com',
      workEmail: 'employee1@trucomm.com',
      softwareLoginEmail: 'employee1@trucomm.com',
      password: await bcrypt.hash('emp123', 12),
      designation: 'EMPLOYEE'
    }
  ];

  for (const userData of sampleUsers) {
    await prisma.user.upsert({
      where: { softwareLoginEmail: userData.softwareLoginEmail },
      update: {},
      create: userData
    });
  }

  // Create super PIN for admin access
  const superPin = await prisma.superPin.upsert({
    where: { pin: '45916394A' },
    update: {},
    create: {
      pin: '45916394A',
      description: 'Super Admin Access PIN',
      isActive: true
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log('📋 Created plans:', [xcommPlan.name, xcommProPlan.name, xcommElitePlan.name]);
  console.log('🎫 Created coupons:', [welcomeCoupon.code, earlyBirdCoupon.code, startupCoupon.code]);
  console.log('👤 Created super admin:', superAdmin.username);
  console.log('👥 Created sample users:', sampleUsers.map(u => u.username));
  console.log('🔐 Created super PIN:', superPin.pin);
  console.log('\n🔐 Super Admin Login Credentials:');
  console.log('Email: admin@trucomm.com');
  console.log('Password: admin123');
  console.log('\n🔑 Admin Access PIN:');
  console.log('PIN: 45916394A');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
