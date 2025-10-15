const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// Create User
router.post('/create-user', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      designation,
      companyName,
      companyId,
      companyAddress,
      password,
      planId,
      softwareLoginEmail,
      mmid,
      purchaseDate,
      purchaseTime,
      transactionId,
      paymentMethod,
      amountPaid,
      currentIP,
      userAgent
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !username || !email || !password || !planId || !mmid) {
      return res.status(400).json({
        success: false,
        error: 'All required fields must be provided'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
          { softwareLoginEmail }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this username, email, or software login email already exists'
      });
    }

    // Check if MMID already exists
    const existingMMID = await prisma.user.findUnique({
      where: { mmid }
    });

    if (existingMMID) {
      return res.status(400).json({
        success: false,
        error: 'MMID already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        workEmail: email,
        designation,
        companyName,
        companyId,
        companyAddress,
        softwareLoginEmail,
        mmid,
        password: hashedPassword,
        currentIP: currentIP || 'MANUAL',
        isActive: true
      }
    });

    // Find the selected plan
    const plan = await prisma.plan.findFirst({
      where: { 
        OR: [
          { name: { contains: 'XComm', mode: 'insensitive' } },
          { id: planId }
        ]
      }
    });

    if (!plan) {
      // If plan not found, create a default plan entry
      const defaultPlan = await prisma.plan.create({
        data: {
          name: planId === 'xcomm' ? 'XComm' : planId === 'xcomm-pro' ? 'XComm Pro' : 'XComm Elite',
          type: 'BASIC',
          description: `${planId === 'xcomm' ? 'XComm' : planId === 'xcomm-pro' ? 'XComm Pro' : 'XComm Elite'} Plan`,
          price: parseFloat(amountPaid) || 999,
          features: ['Basic Features'],
          duration: 12,
          isActive: true
        }
      });

      // Create purchase record
      await prisma.purchase.create({
        data: {
          userId: user.id,
          planId: defaultPlan.id,
          amount: parseFloat(amountPaid) || 999,
          discountAmount: 0,
          gstAmount: (parseFloat(amountPaid) || 999) * 0.18,
          totalAmount: parseFloat(amountPaid) || 999,
          paymentStatus: 'COMPLETED',
          paymentMethod,
          transactionId,
          purchaseDate: new Date(purchaseDate),
          purchaseTime,
          userIP: currentIP || 'MANUAL',
          userAgent
        }
      });
    } else {
      // Create purchase record with existing plan
      await prisma.purchase.create({
        data: {
          userId: user.id,
          planId: plan.id,
          amount: parseFloat(amountPaid) || plan.price,
          discountAmount: 0,
          gstAmount: (parseFloat(amountPaid) || plan.price) * 0.18,
          totalAmount: parseFloat(amountPaid) || plan.price,
          paymentStatus: 'COMPLETED',
          paymentMethod,
          transactionId,
          purchaseDate: new Date(purchaseDate),
          purchaseTime,
          userIP: currentIP || 'MANUAL',
          userAgent
        }
      });
    }

    console.log('User created successfully:', {
      id: user.id,
      username: user.username,
      email: user.email,
      companyName: user.companyName
    });

    res.json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: user.companyName,
        mmid: user.mmid,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    
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

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        purchases: {
          include: {
            plan: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;