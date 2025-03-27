
// middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }

      const payload = decoded as JwtPayload; // Type assertion

      req.userId = payload.userId;
      req.userRole = payload.role;

      next(); // Proceed to the next middleware or controller
    });
  } else {
    return res.status(401).json({ error: 'Authentication token missing' });
  }
};