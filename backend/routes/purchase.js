const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const emailService = require('../services/emailService');
const { 
  generateMMID, 
  generateUsername, 
  generateSoftwareLoginEmail, 
  generateSecurePassword,
  calculateGST,
  calculateCouponDiscount,
  isValidEmail,
  isValidWorkEmail
} = require('../utils/userUtils');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Process purchase and create user account
 */
router.post('/process', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      workEmail,
      designation,
      planId,
      couponCode,
      paymentMethod,
      paymentId,
      userIP,
      userAgent
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !workEmail || !designation || !planId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['firstName', 'lastName', 'workEmail', 'designation', 'planId']
      });
    }

    // Validate work email format
    if (!isValidWorkEmail(workEmail)) {
      return res.status(400).json({ 
        error: 'Invalid work email format. Please use a company email address.' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { workEmail }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this work email already exists' 
      });
    }

    // Get plan details
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan || !plan.isActive) {
      return res.status(400).json({ error: 'Invalid or inactive plan' });
    }

    // Get coupon if provided
    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode }
      });

      if (!coupon || !coupon.isActive) {
        return res.status(400).json({ error: 'Invalid or expired coupon code' });
      }

      // Check if coupon has usage limit
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ error: 'Coupon usage limit exceeded' });
      }

      // Check if coupon is within valid date range
      const now = new Date();
      if (coupon.validFrom > now || (coupon.validUntil && coupon.validUntil < now)) {
        return res.status(400).json({ error: 'Coupon is not valid at this time' });
      }

      // Check minimum amount requirement
      if (coupon.minAmount && plan.price < coupon.minAmount) {
        return res.status(400).json({ 
          error: `Minimum purchase amount of ₹${coupon.minAmount} required for this coupon` 
        });
      }
    }

    // Calculate pricing
    const baseAmount = plan.price;
    const discountAmount = coupon ? calculateCouponDiscount(coupon, baseAmount) : 0;
    const amountAfterDiscount = baseAmount - discountAmount;
    const gstAmount = calculateGST(amountAfterDiscount);
    const totalAmount = amountAfterDiscount + gstAmount;

    // Generate user credentials
    const mmid = generateMMID();
    const username = generateUsername(firstName, lastName, mmid);
    const softwareLoginEmail = generateSoftwareLoginEmail(username, mmid);
    const password = generateSecurePassword();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and purchase in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          username,
          email: workEmail, // Using work email as primary email
          workEmail,
          designation,
          currentIP: userIP,
          mmid,
          softwareLoginEmail,
          password: hashedPassword
        }
      });

      // Create purchase record
      const purchase = await tx.purchase.create({
        data: {
          userId: user.id,
          planId: plan.id,
          couponId: coupon?.id,
          amount: baseAmount,
          discountAmount,
          gstAmount,
          totalAmount,
          paymentStatus: 'COMPLETED',
          paymentId,
          paymentMethod,
          userIP,
          userAgent
        }
      });

      // Update coupon usage count if applicable
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: coupon.usedCount + 1 }
        });
      }

      return { user, purchase };
    });

    // Prepare credentials for download
    const credentials = {
      username: result.user.username,
      softwareLoginEmail: result.user.softwareLoginEmail,
      mmid: result.user.mmid,
      password: password, // Only include in response, not stored in DB
      workEmail: result.user.workEmail,
      designation: result.user.designation,
      planName: plan.name,
      planType: plan.type,
      purchaseId: result.purchase.id,
      totalAmount: result.purchase.totalAmount,
      purchaseDate: result.purchase.purchasedAt
    };

    // Send email with credentials (async, don't wait for it)
    emailService.sendLoginCredentials(result.user, credentials).catch(error => {
      console.error('Failed to send credentials email:', error);
    });

    res.json({
      success: true,
      message: 'Purchase completed successfully',
      credentials,
      user: {
        id: result.user.id,
        username: result.user.username,
        softwareLoginEmail: result.user.softwareLoginEmail,
        mmid: result.user.mmid
      },
      purchase: {
        id: result.purchase.id,
        totalAmount: result.purchase.totalAmount,
        paymentStatus: result.purchase.paymentStatus
      }
    });

  } catch (error) {
    console.error('Purchase processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process purchase',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Get purchase details by ID
 */
router.get('/:purchaseId', async (req, res) => {
  try {
    const { purchaseId } = req.params;

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            softwareLoginEmail: true,
            mmid: true,
            workEmail: true,
            designation: true
          }
        },
        plan: true,
        coupon: true
      }
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.json({ purchase });
  } catch (error) {
    console.error('Get purchase error:', error);
    res.status(500).json({ 
      error: 'Failed to get purchase details',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Get user's purchase history
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const purchases = await prisma.purchase.findMany({
      where: { userId },
      include: {
        plan: true,
        coupon: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ purchases });
  } catch (error) {
    console.error('Get user purchases error:', error);
    res.status(500).json({ 
      error: 'Failed to get purchase history',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
