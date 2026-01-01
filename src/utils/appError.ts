// src/utils/AppError.ts
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errorCode?: string;

  constructor(message: string, statusCode: number, errorCode?: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    // Operational errors are trusted errors (e.g. "User not found", "Validation failed")
    // Non-operational errors are bugs (e.g. "Cannot read property of undefined")
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
