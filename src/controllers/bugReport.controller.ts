import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as bugReportService from '../services/bugReport.service';
import { Prisma, PrismaClient, Role, NotificationCategory } from '@prisma/client';
import * as notificationService from '../services/notification.service';
import { errorLogService } from '../services/errorLog.service';

const prisma = new PrismaClient();

export const createBugReportController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { title, category, description, orderId, productId, vendorId, meta } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required.' });
    }

    // The public URL of the uploaded file is available on `req.file.path` via `multer-storage-cloudinary`.
    const imageUrl = req.file?.path;

    const bugReport = await bugReportService.createBugReportService({
      userId,
      title,
      category,
      description,
      imageUrl,
      orderId: orderId && orderId !== 'null' && orderId !== 'undefined' ? orderId : undefined,
      productId: productId && productId !== 'null' && productId !== 'undefined' ? productId : undefined,
      vendorId: vendorId && vendorId !== 'null' && vendorId !== 'undefined' ? vendorId : undefined,
      meta: meta ? (typeof meta === 'string' ? JSON.parse(meta) : meta) : undefined,
    });

    // --- Start Notification Logic ---
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const admins = await prisma.user.findMany({ where: { role: Role.admin } });

    for (const admin of admins) {
      await notificationService.createNotification({
        userId: admin.id,
        type: 'BUG_REPORT_RECEIVED',
        category: NotificationCategory.SUPPORT,
        title: 'New Bug Report',
        body: `A new bug has been reported by ${user?.name || 'a user'}.`,
        meta: { bugReportId: bugReport.id, orderId: bugReport.orderId },
      });
    }
    // Notify the user that their report has been received
    await notificationService.createNotification({
        userId: userId,
        type: 'BUG_REPORT_RECEIVED',
        category: NotificationCategory.SUPPORT,
        title: 'New Bug Report',
        body: `Your bug report has been received.`,
        meta: { bugReportId: bugReport.id, orderId: bugReport.orderId },
      });
    // --- End Notification Logic ---

    res.status(201).json({ message: 'Bug report submitted successfully.', bugReport });
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to create bug report',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: req.userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'BUG_REPORT_CREATION_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    res.status(500).json({ error: 'Failed to create bug report.', message: error.message });
  }
};

export const updateBugReportStatusController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isResolved } = req.body;

    const updatedBugReport = await bugReportService.updateBugReportStatusService(id, isResolved);

    // --- Start Notification Logic ---
    if (updatedBugReport.isResolved) {
      await notificationService.createNotification({
        userId: updatedBugReport.userId,
        type: 'BUG_REPORT_RESOLVED',
        category: NotificationCategory.SUPPORT,
        title: 'Bug Report Resolved',
        body: `Your bug report has been marked as resolved.`,
        meta: { bugReportId: updatedBugReport.id },
      });
    }
    // --- End Notification Logic ---

    res.status(200).json({ message: 'Bug report status updated successfully.', bugReport: updatedBugReport });
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to update bug report status',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: req.userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'BUG_REPORT_UPDATE_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Bug report not found.' });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update bug report status.', message: error.message });
  }
};
