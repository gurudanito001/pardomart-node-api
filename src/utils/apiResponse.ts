// src/utils/ApiResponse.ts
import { Response } from 'express';

export class ApiResponse {
  public success: boolean;
  public message: string;
  public data: any;
  public error: any;
  public timestamp: string;

  constructor(statusCode: number, message: string, data: any = null, error: any = null) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    this.data = data;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }

  static success(res: Response, message: string = 'Success', data: any = null, statusCode: number = 200) {
    const response = new ApiResponse(statusCode, message, data);
    return res.status(statusCode).json(response);
  }

  static error(res: Response, message: string = 'Error', statusCode: number = 500, error: any = null) {
    const response = new ApiResponse(statusCode, message, null, error);
    return res.status(statusCode).json(response);
  }
}
