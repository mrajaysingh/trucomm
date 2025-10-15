const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkLogin() {
  try {
    console.log('🔍 Checking super admin login...');
    
    const superAdmin = await prisma.superAdmin.findFirst();
    
    if (superAdmin) {
      console.log('✅ Super admin found:');
      console.log('   ID:', superAdmin.id);
      console.log('   Username:', superAdmin.username);
      console.log('   Email:', superAdmin.email);
      console.log('   Software Login Email:', superAdmin.softwareLoginEmail);
      console.log('   Is Active:', superAdmin.isActive);
      
      // Test password
      const testPassword = 'admin123';
      const isValid = await bcrypt.compare(testPassword, superAdmin.password);
      console.log('🔑 Password test (admin123):', isValid ? '✅ Valid' : '❌ Invalid');
      
      // Test login endpoint
      console.log('\n🌐 Testing login endpoint...');
      const response = await fetch('http://localhost:5000/api/super-admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          softwareLoginEmail: superAdmin.softwareLoginEmail,
          password: testPassword,
          userIP: '127.0.0.1',
          userAgent: 'test'
        })
      });
      
      const data = await response.json();
      console.log('📡 Response status:', response.status);
      console.log('📡 Response data:', data);
      
    } else {
      console.log('❌ No super admin found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLogin();
