const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// Setup Super Admin
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      unlockPin,
      currentIP,
      setupPageUrlAlias
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !username || !email || !password || !unlockPin) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate PIN format (8 digits + 1 letter)
    if (!/^[0-9]{8}[A-Za-z]$/.test(unlockPin)) {
      return res.status(400).json({
        success: false,
        error: 'PIN must be 8 numbers followed by 1 letter'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // Check if any super admin already exists
    const existingSuperAdmin = await prisma.superAdmin.findFirst();
    if (existingSuperAdmin) {
      console.log('Deleting existing super admin:', existingSuperAdmin.id);
      
      // Delete existing super admin and related data
      await prisma.superAdminLoginSession.deleteMany({
        where: { superAdminId: existingSuperAdmin.id }
      });
      
      await prisma.superAdmin.delete({
        where: { id: existingSuperAdmin.id }
      });
      
      console.log('Existing super admin deleted successfully');
    }

    // Check if any super pin already exists
    const existingPin = await prisma.superPin.findFirst();
    if (existingPin) {
      console.log('Deleting existing super pin:', existingPin.id);
      
      await prisma.superPin.delete({
        where: { id: existingPin.id }
      });
      
      console.log('Existing super pin deleted successfully');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create super admin
    const superAdmin = await prisma.superAdmin.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        workEmail: email, // Using same email for work email
        softwareLoginEmail: email, // Using same email for software login
        password: hashedPassword,
        currentIP: currentIP || null,
        isActive: true
      }
    });

    // Create super pin
    const superPin = await prisma.superPin.create({
      data: {
        pin: unlockPin,
        description: 'Super Admin Unlock PIN',
        setupPageUrlAlias: setupPageUrlAlias || '/setup-super',
        isActive: true
      }
    });

    console.log('Super Admin created successfully:', {
      id: superAdmin.id,
      username: superAdmin.username,
      email: superAdmin.email,
      pinId: superPin.id
    });

    res.json({
      success: true,
      message: 'Super Admin created successfully',
      data: {
        id: superAdmin.id,
        username: superAdmin.username,
        email: superAdmin.email,
        firstName: superAdmin.firstName,
        lastName: superAdmin.lastName,
        createdAt: superAdmin.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating Super Admin:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return res.status(400).json({
        success: false,
        error: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Check if super admin exists
router.get('/check', async (req, res) => {
  try {
    const superAdmin = await prisma.superAdmin.findFirst();
    
    res.json({
      success: true,
      exists: !!superAdmin,
      data: superAdmin ? {
        id: superAdmin.id,
        username: superAdmin.username,
        email: superAdmin.email,
        firstName: superAdmin.firstName,
        lastName: superAdmin.lastName,
        createdAt: superAdmin.createdAt
      } : null
    });
  } catch (error) {
    console.error('Error checking Super Admin:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
