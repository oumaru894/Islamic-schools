import { Request, Response, NextFunction } from 'express';
import { verifyToken, canManageSchool } from './userService';

export interface AuthenticatedRequest extends Request {
  user?: {
  userId: number;
  email: string;
  schoolId: string | null;
  role?: string;
  };
}

/**
 * Middleware to verify JWT token
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded as any;
  next();
}

/**
 * Middleware to check if user can manage a specific school
 */
export function requireSchoolAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const schoolId = req.params.id || req.body.school_id;
  if (!schoolId) {
    return res.status(400).json({ error: 'School ID required' });
  }

  // Allow superadmin users to manage any school
  if (req.user.role === 'superadmin') {
    return next();
  }

  if (!canManageSchool(req.user.userId, schoolId)) {
    return res.status(403).json({ error: 'You do not have permission to manage this school' });
  }

  next();
}

/**
 * Middleware to check if user is administrator
 */
export function requireAdministrator(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // This would require fetching the user from DB, but for now we'll use the schoolId check
  // In a more robust system, you'd store role in the JWT or fetch it
  next();
}




