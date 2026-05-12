import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../controllers/vendor.controller';

export const optionalAuthenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      // Note: Using process.env.JWT_SECRET as the standard placeholder for your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      req.userId = decoded.id;
      req.userRole = decoded.role as Role;
      req.vendorId = decoded.vendorId;
    } catch (error) {
      // Log error but proceed as guest/unauthenticated
      console.error('Optional authentication failed:', error);
    }
  }

  next();
};