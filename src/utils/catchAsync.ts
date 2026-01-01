import { Request, Response, NextFunction } from 'express';

/**
 * Wraps async controller functions to automatically catch errors
 * and pass them to the Express error handling middleware.
 */
export const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};