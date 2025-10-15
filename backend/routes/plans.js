const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Get all active plans
 */
router.get('/', async (req, res) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });

    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ 
      error: 'Failed to get plans',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Get plan by ID
 */
router.get('/:planId', async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({ plan });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ 
      error: 'Failed to get plan',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Create new plan (Admin only)
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      price,
      features,
      duration
    } = req.body;

    // Validate required fields
    if (!name || !type || !price || !features || !duration) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'type', 'price', 'features', 'duration']
      });
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        type,
        description,
        price,
        features,
        duration
      }
    });

    res.status(201).json({ plan });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ 
      error: 'Failed to create plan',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Update plan (Admin only)
 */
router.put('/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const updateData = req.body;

    const plan = await prisma.plan.update({
      where: { id: planId },
      data: updateData
    });

    res.json({ plan });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ 
      error: 'Failed to update plan',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Delete plan (Admin only)
 */
router.delete('/:planId', async (req, res) => {
  try {
    const { planId } = req.params;

    await prisma.plan.update({
      where: { id: planId },
      data: { isActive: false }
    });

    res.json({ message: 'Plan deactivated successfully' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ 
      error: 'Failed to delete plan',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
