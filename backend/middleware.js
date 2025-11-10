import { verifyToken } from './auth.js';

/**
 * Middleware to authenticate JWT tokens
 * Extracts token from Authorization header and verifies it
 * Adds decoded user data to req.user
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Add user info to request
    next();
  } catch (error) {
    return res.status(403).json({ error: error.message });
  }
}

/**
 * Optional authentication middleware
 * Allows requests without tokens but adds user info if token is present
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // Token invalid, but we allow the request to continue
      console.log('Invalid token provided, continuing without auth');
    }
  }
  
  next();
}
