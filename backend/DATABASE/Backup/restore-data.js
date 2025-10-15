const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreData() {
  try {
    console.log('🔄 Starting database restore...');
    
    const backupPath = path.join(__dirname, 'backupfilefromprisma.json');
    
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file not found!');
    }
    
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    console.log(`📁 Restoring from backup created at: ${backupData.timestamp}`);
    
    // Restore Users
    if (backupData.users.length > 0) {
      console.log(`📦 Restoring ${backupData.users.length} users...`);
      for (const user of backupData.users) {
        await prisma.user.create({
          data: {
            id: user.id,
            username: user.username,
            email: user.email,
            workEmail: user.workEmail,
            designation: user.designation,
            currentIP: user.currentIP,
            mmid: user.mmid,
            softwareLoginEmail: user.softwareLoginEmail,
            password: user.password,
            isActive: user.isActive,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          }
        });
      }
    }

    // Restore Super Admins
    if (backupData.superAdmins.length > 0) {
      console.log(`📦 Restoring ${backupData.superAdmins.length} super admins...`);
      for (const superAdmin of backupData.superAdmins) {
        await prisma.superAdmin.create({
          data: {
            id: superAdmin.id,
            firstName: superAdmin.firstName || 'Unknown',
            lastName: superAdmin.lastName || 'User',
            username: superAdmin.username,
            email: superAdmin.email,
            workEmail: superAdmin.workEmail,
            softwareLoginEmail: superAdmin.softwareLoginEmail,
            password: superAdmin.password,
            currentIP: superAdmin.currentIP,
            mmid: superAdmin.mmid,
            isActive: superAdmin.isActive,
            lastLoginAt: superAdmin.lastLoginAt ? new Date(superAdmin.lastLoginAt) : null,
            createdAt: new Date(superAdmin.createdAt),
            updatedAt: new Date(superAdmin.updatedAt)
          }
        });
      }
    }

    // Restore Super Pins
    if (backupData.superPins.length > 0) {
      console.log(`📦 Restoring ${backupData.superPins.length} super pins...`);
      for (const superPin of backupData.superPins) {
        await prisma.superPin.create({
          data: {
            id: superPin.id,
            pin: superPin.pin,
            description: superPin.description,
            setupPageUrlAlias: superPin.setupPageUrlAlias || '/setup-super',
            isActive: superPin.isActive,
            createdAt: new Date(superPin.createdAt),
            updatedAt: new Date(superPin.updatedAt)
          }
        });
      }
    }

    // Restore Plans
    if (backupData.plans.length > 0) {
      console.log(`📦 Restoring ${backupData.plans.length} plans...`);
      for (const plan of backupData.plans) {
        await prisma.plan.create({
          data: {
            id: plan.id,
            name: plan.name,
            type: plan.type,
            description: plan.description,
            price: plan.price,
            features: plan.features,
            duration: plan.duration,
            isActive: plan.isActive,
            createdAt: new Date(plan.createdAt),
            updatedAt: new Date(plan.updatedAt)
          }
        });
      }
    }

    // Restore Coupons
    if (backupData.coupons.length > 0) {
      console.log(`📦 Restoring ${backupData.coupons.length} coupons...`);
      for (const coupon of backupData.coupons) {
        await prisma.coupon.create({
          data: {
            id: coupon.id,
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minAmount: coupon.minAmount,
            maxDiscount: coupon.maxDiscount,
            usageLimit: coupon.usageLimit,
            usedCount: coupon.usedCount,
            isActive: coupon.isActive,
            validFrom: new Date(coupon.validFrom),
            validUntil: coupon.validUntil ? new Date(coupon.validUntil) : null,
            createdAt: new Date(coupon.createdAt),
            updatedAt: new Date(coupon.updatedAt)
          }
        });
      }
    }

    // Restore Purchases
    if (backupData.purchases.length > 0) {
      console.log(`📦 Restoring ${backupData.purchases.length} purchases...`);
      for (const purchase of backupData.purchases) {
        await prisma.purchase.create({
          data: {
            id: purchase.id,
            userId: purchase.userId,
            planId: purchase.planId,
            couponId: purchase.couponId,
            amount: purchase.amount,
            discountAmount: purchase.discountAmount,
            gstAmount: purchase.gstAmount,
            totalAmount: purchase.totalAmount,
            paymentStatus: purchase.paymentStatus,
            paymentId: purchase.paymentId,
            paymentMethod: purchase.paymentMethod,
            userIP: purchase.userIP,
            userAgent: purchase.userAgent,
            purchasedAt: new Date(purchase.purchasedAt),
            createdAt: new Date(purchase.createdAt),
            updatedAt: new Date(purchase.updatedAt)
          }
        });
      }
    }

    // Restore Login Sessions
    if (backupData.loginSessions.length > 0) {
      console.log(`📦 Restoring ${backupData.loginSessions.length} login sessions...`);
      for (const session of backupData.loginSessions) {
        await prisma.loginSession.create({
          data: {
            id: session.id,
            userId: session.userId,
            token: session.token,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            isActive: session.isActive,
            expiresAt: new Date(session.expiresAt),
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt)
          }
        });
      }
    }

    // Restore Super Admin Login Sessions
    if (backupData.superAdminLoginSessions.length > 0) {
      console.log(`📦 Restoring ${backupData.superAdminLoginSessions.length} super admin login sessions...`);
      for (const session of backupData.superAdminLoginSessions) {
        await prisma.superAdminLoginSession.create({
          data: {
            id: session.id,
            superAdminId: session.superAdminId,
            token: session.token,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            isActive: session.isActive,
            expiresAt: new Date(session.expiresAt),
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt)
          }
        });
      }
    }

    console.log('✅ Restore completed successfully!');
    console.log('🎉 Database has been reset and restored with the new schema!');

  } catch (error) {
    console.error('❌ Error during restore:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

restoreData().catch(console.error);
