const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { 
  authenticateToken, 
  requireSuperAdmin, 
  requireAdminOrCEO, 
  requireManagement,
  validateSession,
  logActivity,
  checkIPAddress 
} = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Login with software credentials
 */
router.post('/login', async (req, res) => {
  try {
    const { softwareLoginEmail, password, userIP, userAgent } = req.body;

    if (!softwareLoginEmail || !password) {
      return res.status(400).json({ 
        error: 'Software login email and password are required' 
      });
    }

    // Find user by software login email
    const user = await prisma.user.findUnique({
      where: { softwareLoginEmail }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update current IP
    await prisma.user.update({
      where: { id: user.id },
      data: { currentIP: userIP }
    });

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        designation: user.designation 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Invalidate all previous sessions for this user (single session policy)
    await prisma.loginSession.updateMany({
      where: {
        userId: user.id,
        isActive: true
      },
      data: {
        isActive: false,
        expiresAt: new Date() // Immediately expire
      }
    });

    // Create new login session
    await prisma.loginSession.create({
      data: {
        userId: user.id,
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
        id: user.id,
        username: user.username,
        softwareLoginEmail: user.softwareLoginEmail,
        mmid: user.mmid,
        workEmail: user.workEmail,
        designation: user.designation
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Refresh access token
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
    const session = await prisma.loginSession.findFirst({
      where: {
        token: refreshToken,
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { 
        userId: session.user.id, 
        username: session.user.username,
        designation: session.user.designation 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      accessToken,
      user: {
        id: session.user.id,
        username: session.user.username,
        softwareLoginEmail: session.user.softwareLoginEmail,
        mmid: session.user.mmid,
        workEmail: session.user.workEmail,
        designation: session.user.designation
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

/**
 * Logout
 */
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Deactivate the session
      await prisma.loginSession.updateMany({
        where: { token: refreshToken },
        data: { isActive: false }
      });
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Logout failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Get user profile
 */
router.get('/profile', authenticateToken, validateSession, checkIPAddress, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        softwareLoginEmail: true,
        mmid: true,
        workEmail: true,
        designation: true,
        currentIP: true,
        createdAt: true,
        purchases: {
          include: {
            plan: true,
            coupon: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Failed to get profile',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Get all users (Super Admin only)
 */
router.get('/users', authenticateToken, requireSuperAdmin, validateSession, logActivity('VIEW_ALL_USERS'), async (req, res) => {
  try {
    console.log('🔍 Users endpoint called by:', req.user?.username, req.user?.id);
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { workEmail: { contains: search, mode: 'insensitive' } },
        { softwareLoginEmail: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role) {
      where.designation = role;
    }
    
    if (status !== '') {
      where.isActive = status === 'active';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          workEmail: true,
          softwareLoginEmail: true,
          designation: true,
          isActive: true,
          currentIP: true,
          mmid: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              purchases: true,
              loginSessions: {
                where: { isActive: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Failed to get users',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Get user by ID (Super Admin only)
 */
router.get('/users/:id', authenticateToken, requireSuperAdmin, validateSession, logActivity('VIEW_USER_DETAILS'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        workEmail: true,
        softwareLoginEmail: true,
        designation: true,
        isActive: true,
        currentIP: true,
        mmid: true,
        createdAt: true,
        updatedAt: true,
        purchases: {
          include: {
            plan: true,
            coupon: true
          },
          orderBy: { createdAt: 'desc' }
        },
        loginSessions: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Failed to get user',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Update user status (Super Admin only)
 */
router.patch('/users/:id/status', authenticateToken, requireSuperAdmin, validateSession, logActivity('UPDATE_USER_STATUS'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean value' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, isActive: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deactivating self
    if (id === req.user.id && !isActive) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        username: true,
        email: true,
        workEmail: true,
        softwareLoginEmail: true,
        designation: true,
        isActive: true,
        updatedAt: true
      }
    });

    // If deactivating user, also deactivate all their sessions
    if (!isActive) {
      await prisma.loginSession.updateMany({
        where: { userId: id },
        data: { isActive: false }
      });
    }

    res.json({ 
      success: true, 
      user: updatedUser,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ 
      error: 'Failed to update user status',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Update user role (Super Admin only)
 */
router.patch('/users/:id/role', authenticateToken, requireSuperAdmin, validateSession, logActivity('UPDATE_USER_ROLE'), async (req, res) => {
  try {
    const { id } = req.params;
    const { designation } = req.body;

    const validRoles = ['ADMIN', 'CEO', 'HR', 'EMPLOYEE'];
    if (!validRoles.includes(designation)) {
      return res.status(400).json({ 
        error: 'Invalid role',
        validRoles 
      });
    }

    // Prevent changing own role
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, designation: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { designation },
      select: {
        id: true,
        username: true,
        email: true,
        workEmail: true,
        softwareLoginEmail: true,
        designation: true,
        isActive: true,
        updatedAt: true
      }
    });

    res.json({ 
      success: true, 
      user: updatedUser,
      message: `User role updated to ${designation} successfully`
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ 
      error: 'Failed to update user role',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Get active sessions (Super Admin only)
 */
router.get('/sessions', authenticateToken, requireSuperAdmin, validateSession, logActivity('VIEW_ACTIVE_SESSIONS'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sessions, total] = await Promise.all([
      prisma.loginSession.findMany({
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              designation: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.loginSession.count({ where: { isActive: true } })
    ]);

    res.json({
      success: true,
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ 
      error: 'Failed to get sessions',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Revoke user session (Super Admin only)
 */
router.delete('/sessions/:sessionId', authenticateToken, requireSuperAdmin, validateSession, logActivity('REVOKE_SESSION'), async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.loginSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: { id: true, username: true }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await prisma.loginSession.update({
      where: { id: sessionId },
      data: { isActive: false }
    });

    res.json({ 
      success: true, 
      message: `Session for user ${session.user.username} revoked successfully`
    });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({ 
      error: 'Failed to revoke session',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Get system statistics (Super Admin only)
 */
router.get('/stats', authenticateToken, requireSuperAdmin, validateSession, logActivity('VIEW_SYSTEM_STATS'), async (req, res) => {
  try {
    console.log('🔍 Stats endpoint called by:', req.user?.username, req.user?.id);
    const [
      totalUsers,
      activeUsers,
      totalSessions,
      activeSessions,
      totalSuperAdminSessions,
      activeSuperAdminSessions,
      totalPurchases,
      recentPurchases,
      roleDistribution,
      recentLogins,
      recentSuperAdminLogins
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.loginSession.count(),
      prisma.loginSession.count({ where: { isActive: true } }),
      prisma.superAdminLoginSession.count(),
      prisma.superAdminLoginSession.count({ where: { isActive: true } }),
      prisma.purchase.count(),
      prisma.purchase.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.user.groupBy({
        by: ['designation'],
        _count: { designation: true }
      }),
      prisma.loginSession.findMany({
        where: { isActive: true },
        include: {
          user: {
            select: { username: true, designation: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.superAdminLoginSession.findMany({
        where: { isActive: true },
        include: {
          superAdmin: {
            select: { username: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers
        },
        sessions: {
          total: totalSessions + totalSuperAdminSessions,
          active: activeSessions + activeSuperAdminSessions
        },
        purchases: {
          total: totalPurchases,
          recent: recentPurchases
        },
        roleDistribution,
        recentLogins: [
          ...recentLogins.map(login => ({
            ...login,
            user: {
              ...login.user,
              designation: login.user.designation
            }
          })),
          ...recentSuperAdminLogins.map(login => ({
            id: login.id,
            ipAddress: login.ipAddress,
            userAgent: login.userAgent,
            createdAt: login.createdAt,
            user: {
              username: login.superAdmin.username,
              designation: 'ADMIN'
            }
          }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get system statistics',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
