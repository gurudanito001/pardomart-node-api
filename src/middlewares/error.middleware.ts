import { Request, Response, NextFunction } from 'express';
import { errorLogService } from '../services/errorLog.service';

/**
 * Global Error Handling Middleware
 * Catches all errors passed to next(err) or thrown in async handlers.
 */
export const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  // Extract user info if available (assumes auth middleware runs before this)
  const userId = (req as any).user?.id || (req as any).user?._id || null;
  const correlationId = (req as any).correlationId || req.headers['x-correlation-id'] || null;

  // Log the error to the database
  // We don't await this to prevent delaying the response, unless strict audit is required
  errorLogService.logError({
    correlationId,
    userId,
    ipAddress: req.ip,
    requestMethod: req.method,
    requestPath: req.originalUrl,
    statusCode,
    errorCode: err.code || err.name || 'INTERNAL_ERROR',
    message,
    stackTrace: err.stack,
    metaData: {
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers, // Be careful logging headers containing auth tokens
    },
  });

  // Send response to client
  // In production, you might want to hide the stack trace and internal error details
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: statusCode === 500 ? 'Something went wrong' : message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
