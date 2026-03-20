import { Router } from 'express';
import { createBugReportController, updateBugReportStatusController } from '../controllers/bugReport.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import { Role } from '@prisma/client';
import { validate, validateUpdateBugReportStatus } from '../middlewares/validation.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: BugReport
 *   description: Bug reporting
 */

/**
 * @swagger
 * /bug-reports:
 *   post:
 *     summary: Report a bug
 *     tags: [BugReport]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [description]
 *             properties:
 *               title:
 *                 type: string
 *                 description: A short summary of the bug.
 *               category:
 *                 type: string
 *                 enum: [ORDER_ISSUE, PRODUCT_ISSUE, VENDOR_ISSUE, PAYMENT_ISSUE, APP_CRASH, APP_PERFORMANCE, UI_UX_ISSUE, ACCOUNT_ISSUE, OTHER]
 *                 description: The category of the bug.
 *               description:
 *                 type: string
 *                 description: A description of the bug.
 *               orderId:
 *                 type: string
 *                 format: uuid
 *                 description: (Optional) The ID of the order related to the bug.
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 description: (Optional) The ID of the product related to the bug.
 *               vendorId:
 *                 type: string
 *                 format: uuid
 *                 description: (Optional) The ID of the vendor related to the bug.
 *               meta:
 *                 type: string
 *                 description: (Optional) Additional JSON metadata (e.g., device info, app version) passed as a JSON string.
 *                 example: '{"os": "iOS 16.0", "appVersion": "1.2.0"}'
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: (Optional) An image of the bug.
 *     responses:
 *       201:
 *         description: Bug report created successfully.
 */
router.post('/', authenticate, upload.single('image'), createBugReportController);

/**
 * @swagger
 * /bug-reports/{id}/status:
 *   patch:
 *     summary: Update a bug report's status (Admin only)
 *     tags: [BugReport, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the bug report to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isResolved]
 *             properties:
 *               isResolved:
 *                 type: boolean
 *                 description: Set to true to mark the bug as resolved, false to mark it as unresolved.
 *     responses:
 *       200:
 *         description: Bug report status updated successfully.
 */
router.patch('/:id/status', authenticate, authorize([Role.admin]), validate(validateUpdateBugReportStatus), updateBugReportStatusController);

export default router;