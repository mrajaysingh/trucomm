const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupAdminUsers() {
  console.log('🧹 Starting cleanup of old admin users...');

  try {
    // Delete old admin users from users table
    const result = await prisma.user.deleteMany({
      where: {
        designation: 'ADMIN'
      }
    });

    console.log(`✅ Deleted ${result.count} admin users from users table`);

    // Also clean up their login sessions
    const sessionResult = await prisma.loginSession.deleteMany({
      where: {
        user: {
          designation: 'ADMIN'
        }
      }
    });

    console.log(`✅ Deleted ${sessionResult.count} login sessions for admin users`);

    console.log('🎉 Cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupAdminUsers()
  .catch((error) => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  });
