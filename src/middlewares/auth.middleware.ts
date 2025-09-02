
// middlewares/auth.middleware.ts
import { Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.SECRET as string;

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: Role;
  vendorId?: string;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>
    console.log(token)

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }

      const payload = decoded as JwtPayload; // Type assertion

      req.userId = payload.userId;
      req.userRole = payload.role;
      req.vendorId = payload.vendorId

      next(); // Proceed to the next middleware or controller
    });
  } else {
    return res.status(401).json({ error: 'Authentication token missing' });
  }
};



// Middleware to authorize access for vendor staff or admin roles
export const authorizeVendorAccess = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.userRole || (authReq.userRole !== "vendor_staff" && authReq.userRole !== "vendor")) {
    return res.status(403).json({ message: 'Forbidden: Requires vendor staff or admin role.' });
  }
  // Ensure the user is actually associated with a vendor (critical check)
  if (authReq.userRole === "vendor_staff" && !authReq.vendorId) {
    return res.status(403).json({ message: 'Forbidden: User is not associated with a vendor.' });
  }
  next();
};