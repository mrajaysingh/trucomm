const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if this is a super admin token
    if (decoded.isSuperAdmin) {
      console.log('🔍 Super admin token detected, userId:', decoded.userId);
      // Get super admin from database
      const superAdmin = await prisma.superAdmin.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
          workEmail: true,
          softwareLoginEmail: true,
          isActive: true,
          currentIP: true,
          mmid: true
        }
      });
      console.log('🔍 Super admin found:', !!superAdmin, superAdmin?.username);

      if (!superAdmin) {
        return res.status(401).json({ 
          error: 'Super admin not found',
          code: 'SUPER_ADMIN_NOT_FOUND'
        });
      }

      if (!superAdmin.isActive) {
        return res.status(401).json({ 
          error: 'Account is deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Check if super admin session is still active
      const activeSession = await prisma.superAdminLoginSession.findFirst({
        where: {
          superAdminId: superAdmin.id,
          isActive: true,
          expiresAt: { gt: new Date() }
        }
      });
      console.log('🔍 Active session found:', !!activeSession);

      if (!activeSession) {
        console.log('❌ No active session found for super admin');
        return res.status(401).json({ 
          error: 'Session expired or invalid',
          code: 'SESSION_EXPIRED'
        });
      }

      // Attach super admin info to request with designation
      req.user = {
        ...superAdmin,
        designation: 'ADMIN', // Add designation for compatibility
        token: token
      };
    } else {
      // Get regular user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
          workEmail: true,
          softwareLoginEmail: true,
          designation: true,
          isActive: true,
          currentIP: true,
          mmid: true
        }
      });

      if (!user) {
        return res.status(401).json({ 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({ 
          error: 'Account is deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Check if session is still active
      const activeSession = await prisma.loginSession.findFirst({
        where: {
          userId: user.id,
          isActive: true,
          expiresAt: { gt: new Date() }
        }
      });

      if (!activeSession) {
        return res.status(401).json({ 
          error: 'Session expired or invalid',
          code: 'SESSION_EXPIRED'
        });
      }

      // Attach user info to request
      req.user = {
        ...user,
        token: token
      };
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware to check if user has specific role
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    console.log('🔍 requireRole check:', { 
      hasUser: !!req.user, 
      userRole: req.user?.designation, 
      requiredRoles: roles,
      userId: req.user?.id 
    });
    
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.designation;
    
    // Convert single role to array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      console.log('❌ Insufficient permissions:', { userRole, allowedRoles });
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: userRole
      });
    }

    console.log('✅ Role check passed');
    next();
  };
};

/**
 * Middleware to check if user is super admin (ADMIN role)
 */
const requireSuperAdmin = requireRole('ADMIN');

/**
 * Middleware to check if user is admin or CEO
 */
const requireAdminOrCEO = requireRole(['ADMIN', 'CEO']);

/**
 * Middleware to check if user is admin, CEO, or HR
 */
const requireManagement = requireRole(['ADMIN', 'CEO', 'HR']);

/**
 * Middleware to validate session and refresh if needed
 */
const validateSession = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    let session;
    
    // Check if this is a super admin by checking if user exists in SuperAdmin table
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { id: req.user.id },
      select: { id: true }
    });
    
    if (superAdmin) {
      // For super admins, check SuperAdminLoginSession table
      session = await prisma.superAdminLoginSession.findFirst({
        where: {
          superAdminId: req.user.id,
          isActive: true,
          expiresAt: { gt: new Date() }
        }
      });
    } else {
      // For regular users, check LoginSession table
      session = await prisma.loginSession.findFirst({
        where: {
          userId: req.user.id,
          isActive: true,
          expiresAt: { gt: new Date() }
        }
      });
    }

    if (!session) {
      return res.status(401).json({ 
        error: 'Session not found or expired',
        code: 'SESSION_NOT_FOUND'
      });
    }

    // Check if session expires within 5 minutes
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    if (session.expiresAt < fiveMinutesFromNow) {
      // Extend session by 7 days
      if (superAdmin) {
        // For super admins, update SuperAdminLoginSession
        await prisma.superAdminLoginSession.update({
          where: { id: session.id },
          data: { 
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        });
      } else {
        // For regular users, update LoginSession
        await prisma.loginSession.update({
          where: { id: session.id },
          data: { 
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        });
      }
    }

    next();
  } catch (error) {
    console.error('Session validation error:', error);
    return res.status(500).json({ 
      error: 'Session validation failed',
      code: 'SESSION_VALIDATION_ERROR'
    });
  }
};

/**
 * Middleware to log user activity
 */
const logActivity = (action) => {
  return async (req, res, next) => {
    try {
      if (req.user) {
        // Log the activity (you can extend this to save to a separate activity log table)
        console.log(`User ${req.user.username} (${req.user.id}) performed action: ${action} at ${new Date().toISOString()}`);
      }
      next();
    } catch (error) {
      console.error('Activity logging error:', error);
      // Don't fail the request if logging fails
      next();
    }
  };
};

/**
 * Middleware to check IP address (optional security feature)
 */
const checkIPAddress = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userIP = req.user.currentIP;

    // If user has a stored IP and it doesn't match, log it but don't block
    if (userIP && userIP !== clientIP) {
      console.warn(`IP mismatch for user ${req.user.username}: stored=${userIP}, current=${clientIP}`);
      
      // Update the current IP
      await prisma.user.update({
        where: { id: req.user.id },
        data: { currentIP: clientIP }
      });
    }

    next();
  } catch (error) {
    console.error('IP check error:', error);
    // Don't fail the request if IP check fails
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireSuperAdmin,
  requireAdminOrCEO,
  requireManagement,
  validateSession,
  logActivity,
  checkIPAddress
};
