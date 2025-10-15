const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// Verify PIN endpoint
router.post('/verify-pin', async (req, res) => {
  try {
    const { pin } = req.body;

    // Validate input
    if (!pin || typeof pin !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'PIN is required'
      });
    }

    // Check if PIN exists and is active
    const superPin = await prisma.superPin.findFirst({
      where: {
        pin: pin.trim(),
        isActive: true
      }
    });

    if (!superPin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid PIN'
      });
    }

    // Log successful PIN verification
    console.log(`✅ PIN verification successful at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'PIN verified successfully'
    });

  } catch (error) {
    console.error('PIN verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get PIN status (for admin purposes)
router.get('/status', async (req, res) => {
  try {
    const pins = await prisma.superPin.findMany({
      select: {
        id: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      pins: pins
    });

  } catch (error) {
    console.error('PIN status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create new PIN (admin only)
router.post('/create', async (req, res) => {
  try {
    const { pin, description } = req.body;

    // Validate input
    if (!pin || typeof pin !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'PIN is required'
      });
    }

    // Check if PIN already exists
    const existingPin = await prisma.superPin.findUnique({
      where: {
        pin: pin.trim()
      }
    });

    if (existingPin) {
      return res.status(409).json({
        success: false,
        error: 'PIN already exists'
      });
    }

    // Create new PIN
    const newPin = await prisma.superPin.create({
      data: {
        pin: pin.trim(),
        description: description || null,
        isActive: true
      }
    });

    console.log(`✅ New PIN created: ${newPin.id}`);

    res.status(201).json({
      success: true,
      message: 'PIN created successfully',
      pin: {
        id: newPin.id,
        description: newPin.description,
        isActive: newPin.isActive,
        createdAt: newPin.createdAt
      }
    });

  } catch (error) {
    console.error('PIN creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update PIN status (admin only)
router.patch('/:pinId/status', async (req, res) => {
  try {
    const { pinId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isActive must be a boolean'
      });
    }

    const updatedPin = await prisma.superPin.update({
      where: {
        id: pinId
      },
      data: {
        isActive: isActive
      }
    });

    console.log(`✅ PIN ${pinId} status updated to ${isActive}`);

    res.json({
      success: true,
      message: 'PIN status updated successfully',
      pin: {
        id: updatedPin.id,
        isActive: updatedPin.isActive,
        updatedAt: updatedPin.updatedAt
      }
    });

  } catch (error) {
    console.error('PIN status update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete PIN (admin only)
router.delete('/:pinId', async (req, res) => {
  try {
    const { pinId } = req.params;

    await prisma.superPin.delete({
      where: {
        id: pinId
      }
    });

    console.log(`✅ PIN ${pinId} deleted`);

    res.json({
      success: true,
      message: 'PIN deleted successfully'
    });

  } catch (error) {
    console.error('PIN deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
