import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as bugReportService from '../services/bugReport.service';
import { Prisma, PrismaClient, Role } from '@prisma/client';
import * as notificationService from '../services/notification.service';

const prisma = new PrismaClient();

export const createBugReportController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required.' });
    }

    // The public URL of the uploaded file is available on `req.file.path` via `multer-storage-cloudinary`.
    const imageUrl = req.file?.path;

    const bugReport = await bugReportService.createBugReportService({
      userId,
      description,
      imageUrl,
    });

    // --- Start Notification Logic ---
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const admins = await prisma.user.findMany({ where: { role: Role.admin } });

    for (const admin of admins) {
      await notificationService.createNotification({
        userId: admin.id,
        type: 'BUG_REPORT_RECEIVED',
        title: 'New Bug Report',
        body: `A new bug has been reported by ${user?.name || 'a user'}.`,
        meta: { bugReportId: bugReport.id },
      });
    }
    // Notify the user that their report has been received
    await notificationService.createNotification({
        userId: userId,
        type: 'BUG_REPORT_RECEIVED',
        title: 'New Bug Report',
        body: `Your bug report has been received'}.`,
        meta: { bugReportId: bugReport.id },
      });
    // --- End Notification Logic ---

    res.status(201).json({ message: 'Bug report submitted successfully.', bugReport });
  } catch (error: any) {
    console.error('Error creating bug report:', error);
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
        title: 'Bug Report Resolved',
        body: `Your bug report has been marked as resolved.`,
        meta: { bugReportId: updatedBugReport.id },
      });
    }
    // --- End Notification Logic ---

    res.status(200).json({ message: 'Bug report status updated successfully.', bugReport: updatedBugReport });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Bug report not found.' });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    console.error('Error updating bug report status:', error);
    res.status(500).json({ error: 'Failed to update bug report status.', message: error.message });
  }
};
