const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { 
  authenticateToken, 
  logActivity,
  checkIPAddress 
} = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Super Admin Login
 */
router.post('/login', async (req, res) => {
  try {
    const { softwareLoginEmail, password, userIP, userAgent } = req.body;

    if (!softwareLoginEmail || !password) {
      return res.status(400).json({ 
        error: 'Software login email and password are required' 
      });
    }

    // Find super admin by software login email
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { softwareLoginEmail }
    });

    if (!superAdmin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!superAdmin.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, superAdmin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update current IP and last login
    await prisma.superAdmin.update({
      where: { id: superAdmin.id },
      data: { 
        currentIP: userIP,
        lastLoginAt: new Date()
      }
    });

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { 
        userId: superAdmin.id, 
        username: superAdmin.username,
        designation: 'ADMIN',
        isSuperAdmin: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: superAdmin.id, isSuperAdmin: true },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Invalidate all previous sessions for this super admin (single session policy)
    await prisma.superAdminLoginSession.updateMany({
      where: {
        superAdminId: superAdmin.id,
        isActive: true
      },
      data: {
        isActive: false,
        expiresAt: new Date() // Immediately expire
      }
    });

    // Create new login session
    await prisma.superAdminLoginSession.create({
      data: {
        superAdminId: superAdmin.id,
        token: refreshToken,
        ipAddress: userIP,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: superAdmin.id,
        username: superAdmin.username,
        email: superAdmin.email,
        workEmail: superAdmin.workEmail,
        softwareLoginEmail: superAdmin.softwareLoginEmail,
        designation: 'ADMIN',
        mmid: superAdmin.mmid,
        isActive: superAdmin.isActive
      }
    });

  } catch (error) {
    console.error('Super admin login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Refresh access token for super admin
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if session exists and is active
    const session = await prisma.superAdminLoginSession.findFirst({
      where: {
        token: refreshToken,
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      include: { superAdmin: true }
    });

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { 
        userId: session.superAdmin.id, 
        username: session.superAdmin.username,
        designation: 'ADMIN',
        isSuperAdmin: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      accessToken,
      user: {
        id: session.superAdmin.id,
        username: session.superAdmin.username,
        email: session.superAdmin.email,
        workEmail: session.superAdmin.workEmail,
        softwareLoginEmail: session.superAdmin.softwareLoginEmail,
        designation: 'ADMIN',
        mmid: session.superAdmin.mmid,
        isActive: session.superAdmin.isActive
      }
    });

  } catch (error) {
    console.error('Super admin refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

/**
 * Super Admin Logout
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Deactivate the session
      await prisma.superAdminLoginSession.updateMany({
        where: { token: refreshToken },
        data: { isActive: false }
      });
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Super admin logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * Get Super Admin Profile
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        workEmail: true,
        softwareLoginEmail: true,
        mmid: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!superAdmin) {
      return res.status(404).json({ error: 'Super admin not found' });
    }

    res.json({
      success: true,
      user: {
        ...superAdmin,
        designation: 'ADMIN'
      }
    });
  } catch (error) {
    console.error('Get super admin profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

module.exports = router;
