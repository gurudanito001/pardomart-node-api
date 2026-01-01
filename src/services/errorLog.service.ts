import { PrismaClient } from '@prisma/client';

// Instantiate Prisma Client (or import your existing singleton instance if you have one)
const prisma = new PrismaClient();

export interface LogErrorParams {
  correlationId?: string;
  userId?: string;
  ipAddress?: string;
  requestMethod?: string;
  requestPath?: string;
  statusCode?: number;
  errorCode?: string;
  message: string;
  stackTrace?: string;
  metaData?: Record<string, any>;
}

export interface GetErrorLogsParams {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  statusCode?: number;
  userId?: string;
  correlationId?: string;
}

export class ErrorLogService {
  /**
   * Logs an error to the database.
   * Wraps the DB call in a try/catch to ensure logging failures do not crash the main application.
   */
  async logError(params: LogErrorParams): Promise<void> {
    try {
      const sanitizedMeta = this.sanitizeLogData(params.metaData);

      await prisma.errorLog.create({
        data: {
          correlationId: params.correlationId || null,
          userId: params.userId || null,
          ipAddress: params.ipAddress || null,
          requestMethod: params.requestMethod || null,
          requestPath: params.requestPath || null,
          statusCode: params.statusCode || 500,
          errorCode: params.errorCode || 'UNKNOWN_ERROR',
          message: params.message,
          stackTrace: params.stackTrace || null,
          metaData: sanitizedMeta,
        },
      });
    } catch (loggingError) {
      // Fallback: If the DB is down, we must still see the error in stdout
      console.error('CRITICAL: Failed to write error to DB', loggingError);
      console.error('ORIGINAL ERROR:', params.message, params.stackTrace);
    }
  }

  /**
   * Retrieves a single error log by ID.
   */
  async getErrorLogById(id: string) {
    return prisma.errorLog.findUnique({
      where: { id },
    });
  }

  /**
   * Retrieves a paginated list of error logs based on filters.
   */
  async getErrorLogs(params: GetErrorLogsParams = {}) {
    const {
      page = 1,
      limit = 50,
      startDate,
      endDate,
      statusCode,
      userId,
      correlationId,
    } = params;

    // Build the dynamic where clause
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    if (statusCode) where.statusCode = statusCode;
    if (userId) where.userId = userId;
    if (correlationId) where.correlationId = correlationId;

    const [logs, total] = await Promise.all([
      prisma.errorLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.errorLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Recursively scrubs sensitive fields from the metadata object.
   * Prevents leaking passwords, tokens, or credit card info into logs.
   */
  private sanitizeLogData(data: any): any {
    if (!data) return {};

    // Keys that should never be logged in plain text
    const sensitiveKeys = ['password', 'token', 'authorization', 'bearer', 'credit_card', 'cvv', 'secret'];

    const scrub = (obj: any, seen = new WeakSet()): any => {
      if (!obj || typeof obj !== 'object') return obj;
      
      // Handle circular references
      if (seen.has(obj)) return '[CIRCULAR]';
      seen.add(obj);

      if (Array.isArray(obj)) {
        return obj.map((item) => scrub(item, seen));
      }

      const newObj: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const lowerKey = key.toLowerCase();
          if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
            newObj[key] = '[REDACTED]';
          } else {
            newObj[key] = scrub(obj[key], seen);
          }
        }
      }
      return newObj;
    };

    return scrub(data);
  }
}

export const errorLogService = new ErrorLogService();