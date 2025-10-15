const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkSuperAdmin() {
  try {
    console.log('🔍 Checking super admin...');
    
    const superAdmin = await prisma.superAdmin.findFirst();
    
    if (superAdmin) {
      console.log('✅ Super admin found:');
      console.log('   ID:', superAdmin.id);
      console.log('   Username:', superAdmin.username);
      console.log('   Email:', superAdmin.email);
      console.log('   Software Login Email:', superAdmin.softwareLoginEmail);
      console.log('   First Name:', superAdmin.firstName);
      console.log('   Last Name:', superAdmin.lastName);
      console.log('   Is Active:', superAdmin.isActive);
      console.log('   Created At:', superAdmin.createdAt);
      
      // Reset password to a known value
      const newPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      await prisma.superAdmin.update({
        where: { id: superAdmin.id },
        data: { password: hashedPassword }
      });
      
      console.log('🔑 Password reset to:', newPassword);
      console.log('📧 Login with email:', superAdmin.softwareLoginEmail);
      
    } else {
      console.log('❌ No super admin found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSuperAdmin();
