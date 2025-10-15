const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Validate coupon code
 */
router.post('/validate', async (req, res) => {
  try {
    const { code, amount } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code }
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({ error: 'Coupon is not active' });
    }

    // Check if coupon has usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit exceeded' });
    }

    // Check if coupon is within valid date range
    const now = new Date();
    if (coupon.validFrom > now) {
      return res.status(400).json({ error: 'Coupon is not yet valid' });
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }

    // Check minimum amount requirement
    if (coupon.minAmount && amount < coupon.minAmount) {
      return res.status(400).json({ 
        error: `Minimum purchase amount of ₹${coupon.minAmount} required for this coupon`,
        minAmount: coupon.minAmount
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'FIXED') {
      discount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed the amount
    discount = Math.min(discount, amount);

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount
      },
      discount,
      discountAmount: discount
    });

  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ 
      error: 'Failed to validate coupon',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Get all active coupons
 */
router.get('/', async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ coupons });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ 
      error: 'Failed to get coupons',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Create new coupon (Admin only)
 */
router.post('/', async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minAmount,
      maxDiscount,
      usageLimit,
      validFrom,
      validUntil
    } = req.body;

    // Validate required fields
    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['code', 'discountType', 'discountValue']
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code }
    });

    if (existingCoupon) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        description,
        discountType,
        discountValue,
        minAmount,
        maxDiscount,
        usageLimit,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null
      }
    });

    res.status(201).json({ coupon });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ 
      error: 'Failed to create coupon',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Update coupon (Admin only)
 */
router.put('/:couponId', async (req, res) => {
  try {
    const { couponId } = req.params;
    const updateData = req.body;

    const coupon = await prisma.coupon.update({
      where: { id: couponId },
      data: updateData
    });

    res.json({ coupon });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ 
      error: 'Failed to update coupon',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Delete coupon (Admin only)
 */
router.delete('/:couponId', async (req, res) => {
  try {
    const { couponId } = req.params;

    await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: false }
    });

    res.json({ message: 'Coupon deactivated successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ 
      error: 'Failed to delete coupon',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
