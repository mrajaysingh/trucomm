const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function migrateSuperAdmins() {
  console.log('🔄 Starting super admin migration...');

  try {
    // First, let's check if there are any users with ADMIN designation
    const adminUsers = await prisma.user.findMany({
      where: {
        designation: 'ADMIN'
      }
    });

    console.log(`📊 Found ${adminUsers.length} admin users to migrate`);

    if (adminUsers.length === 0) {
      console.log('✅ No admin users found to migrate');
      return;
    }

    // Migrate each admin user to super_admins table
    for (const adminUser of adminUsers) {
      console.log(`🔄 Migrating admin user: ${adminUser.username}`);

      // Create super admin record
      const superAdmin = await prisma.superAdmin.create({
        data: {
          id: adminUser.id, // Keep the same ID
          username: adminUser.username,
          email: adminUser.email,
          workEmail: adminUser.workEmail,
          softwareLoginEmail: adminUser.softwareLoginEmail,
          password: adminUser.password, // Keep the same password
          currentIP: adminUser.currentIP,
          mmid: adminUser.mmid,
          isActive: adminUser.isActive,
          createdAt: adminUser.createdAt,
          updatedAt: adminUser.updatedAt
        }
      });

      console.log(`✅ Created super admin: ${superAdmin.username}`);

      // Migrate login sessions
      const loginSessions = await prisma.loginSession.findMany({
        where: {
          userId: adminUser.id
        }
      });

      for (const session of loginSessions) {
        await prisma.superAdminLoginSession.create({
          data: {
            id: session.id, // Keep the same ID
            superAdminId: superAdmin.id,
            token: session.token,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            isActive: session.isActive,
            expiresAt: session.expiresAt,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt
          }
        });
      }

      console.log(`✅ Migrated ${loginSessions.length} login sessions for ${superAdmin.username}`);
    }

    console.log('🎉 Super admin migration completed successfully!');
    console.log('⚠️  Next steps:');
    console.log('1. Run: npx prisma db push');
    console.log('2. Update your application code to use the new SuperAdmin model');
    console.log('3. Delete the old admin users from the users table (optional)');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateSuperAdmins()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
