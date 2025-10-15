const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    console.log('🔍 Finding super admin...');
    
    const superAdmin = await prisma.superAdmin.findFirst();
    
    if (superAdmin) {
      console.log('✅ Super admin found:');
      console.log('   Username:', superAdmin.username);
      console.log('   Email:', superAdmin.email);
      console.log('   Current hash:', superAdmin.password);
      
      // Set new password
      const newPassword = 'admin123'; // You can change this
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      await prisma.superAdmin.update({
        where: { id: superAdmin.id },
        data: { password: hashedPassword }
      });
      
      console.log('🔑 Password reset successfully!');
      console.log('📧 Login with email:', superAdmin.softwareLoginEmail);
      console.log('🔐 New password:', newPassword);
      
    } else {
      console.log('❌ No super admin found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
