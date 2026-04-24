import { Request, Response } from 'express';
import * as userService from '../services/user.service'; // Assuming you have a user.service.ts file
import { User, Role, ReplacementPreference, MeasurementUnit } from '@prisma/client'; // Import User type
import { GetUserFilters } from '../models/user.model';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { errorLogService } from '../services/errorLog.service';

// User Controllers
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get a paginated list of users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mobileVerified
 *         schema:
 *           type: boolean
 *         description: Filter by mobile verification status.
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status.
 *       - in: query
 *         name: online
 *         schema:
 *           type: boolean
 *         description: Filter by online status.
 *       - in: query
 *         name: role
 *         schema:
 *           $ref: '#/components/schemas/Role'
 *         description: Filter by user role.
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by language.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or mobile number.
 *     responses:
 *       200:
 *         description: A paginated list of users.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedUsers'
 * components:
 *   schemas:
 *     Role:
 *       type: string
 *       enum: [admin, vendor, store_shopper, delivery, customer, shopper]
 *     Verification:
 *       type: object
 *       properties:
 *         mobileNumber:
 *           type: string
 *         code:
 *           type: string
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         attempts:
 *           type: integer
 *           nullable: true
 *     User:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         name: { type: string }
 *         email: { type: string, format: email }
 *         mobileNumber: { type: string }
 *         mobileVerified: { type: boolean }
 *         image: { type: string, nullable: true }
 *         dynamicMediaUrls: { type: object, nullable: true }
 *         active: { type: boolean }
 *         online: { type: boolean }
 *         language: { type: string, nullable: true }
 *         notification: { type: object, nullable: true }
 *         rememberToken: { type: string, nullable: true }
 *         stripeCustomerId: { type: string, nullable: true }
 *         referralCode: { type: string, nullable: true }
 *         role: { $ref: '#/components/schemas/Role' }
 *         vendorId: { type: string, format: uuid, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *         replacementPreference: { type: string, enum: [dont_replace, send_request], default: send_request }
 *         measurementUnit: { type: string, enum: [imperial, metric], default: metric }
 *     PaginatedUsers:
 *       type: object
 *       properties:
 *         page: { type: integer }
 *         totalPages: { type: integer }
 *         pageSize: { type: integer }
 *         totalCount: { type: integer }
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *     UpdateUserPayload:
 *       type: object
 *       properties:
 *         name: { type: string }
 *         email: { type: string, format: email }
 *         mobileNumber: { type: string }
 *         image: { type: string, description: "Base64 encoded image or URL" }
 *         role: { $ref: '#/components/schemas/Role' }
 *         mobileVerified: { type: boolean }
 *         active: { type: boolean }
 *         online: { type: boolean }
 *         language: { type: string }
 *         notification: { type: object }
 *         referralCode: { type: string }
 *         replacementPreference: { type: string, enum: [dont_replace, send_request] }
 *         measurementUnit: { type: string, enum: [imperial, metric] }
 */
export const getAllUsers = async (req: Request, res: Response) => {
  // express-validator has already sanitized and converted types
  const { mobileVerified, active, role, language, page, size, search, online } = req.query;

  const filters: GetUserFilters & { search?: string } = {
    mobileVerified: mobileVerified as boolean | undefined,
    active: active as boolean | undefined,
    online: online as boolean | undefined,
    role: role as Role | undefined,
    language: language as string | undefined,
    search: search as string | undefined,
  };

  const pagination = {
    page: (page as number | undefined) || 1,
    take: (size as number | undefined) || 20,
  };
  try {
    const users = await userService.getAllUsers(filters, pagination); // Pass query params for filtering
    res.status(200).json(users);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to get all users',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'GET_ALL_USERS_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /users/admin:
 *   post:
 *     summary: Create a new admin user (Admin)
 *     tags: [User, Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserPayload'
 *     responses:
 *       201:
 *         description: The created admin user.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
export const createAdminController = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const admin = await userService.createAdminService(payload);
    res.status(201).json(admin);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to create admin user',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'CREATE_ADMIN_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /users/admin/{id}:
 *   patch:
 *     summary: Update an admin user profile (Admin)
 *     tags: [User, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserPayload'
 *     responses:
 *       200:
 *         description: The updated admin user.
 *       500:
 *         description: Internal server error.
 */
export const updateAdminController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const updatedAdmin = await userService.updateAdminService(id, payload);
    res.status(200).json(updatedAdmin);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to update admin user',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'UPDATE_ADMIN_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /users/admin/{id}/deactivate:
 *   patch:
 *     summary: Deactivate an admin user account (Admin)
 *     tags: [User, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The deactivated admin user.
 *       500:
 *         description: Internal server error.
 */
export const deactivateAdminController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deactivatedAdmin = await userService.deactivateAdminService(id);
    res.status(200).json(deactivatedAdmin);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to deactivate admin user',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'DEACTIVATE_ADMIN_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /users/admin/stats:
 *   get:
 *     summary: Get admin statistics (Admin)
 *     tags: [User, Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves statistics about admin users, including total count and active count.
 *     responses:
 *       200:
 *         description: Admin statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAdmins: { type: integer }
 *                 activeAdmins: { type: integer }
 */
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const stats = await userService.getAdminStatsService();
    res.status(200).json(stats);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to get admin stats',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'GET_ADMIN_STATS_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /users/admin/export:
 *   get:
 *     summary: Export list of admins (Admin)
 *     tags: [User, Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Downloads a CSV file containing a list of all admin users.
 *     responses:
 *       200:
 *         description: CSV file download.
 */
export const exportAdmins = async (req: Request, res: Response) => {
  try {
    const csv = await userService.exportAdminsService();
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="admins.csv"');
    res.send(csv);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to export admins',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'EXPORT_ADMINS_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /users/verificationCodes:
 *   get:
 *     summary: Get all verification codes
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves all stored verification codes. Intended for admin/debugging purposes.
 *     responses:
 *       200:
 *         description: A list of all verification codes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Verification' }
 */
export const getAllVerificationCodes = async (req: Request, res: Response) => {
  try {
    const verificationCodes = await userService.getAllVerificationCodes();
    res.status(200).json(verificationCodes);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to get all verification codes',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'GET_ALL_VERIFICATION_CODES_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by their ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user to retrieve.
 *     responses:
 *       200:
 *         description: The requested user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found.
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to get user by ID',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'GET_USER_BY_ID_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    res.status(500).json({ error: 'Internal server error' });
  }
};

/*
 * Note: The createUser endpoint is handled by /auth/register,
 * so this controller is not currently exposed in the routes.
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to create user',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'CREATE_USER_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /users/update:
 *   put:
 *     summary: Update the authenticated user's details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserPayload'
 *     responses:
 *       200:
 *         description: The updated user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found.
 */
export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const payload = req.body;

    // Sanitize image data: remove data URI prefix if it exists, for base64 uploads.
    if (payload.image && payload.image.startsWith('data:')) {
      payload.image = payload.image.split(',')[1];
    }

    const updatedUser = await userService.updateUser(userId, payload);
    res.status(200).json(updatedUser);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to update user',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: req.userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'UPDATE_USER_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    if (error?.code === 'P2025') { // Prisma's error code for record not found on update
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [User]
 *     description: >
 *       Permanently deletes the user account. 
 *       This operation will fail if the user has active orders (orders not in a terminal state).
 *       For administrative deletion of other users, admin privileges are required. 
 *       For self-deletion, use the authenticated route.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user to delete. (Must match authenticated user ID unless admin).
 *     responses:
 *       200:
 *         description: The deleted user.
 *       400:
 *         description: Bad Request (e.g., active orders exist).
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const deletedUser = await userService.deleteUser(userId);
    res.status(200).json(deletedUser);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to delete user',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'DELETE_USER_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    if (error.message.includes('active orders')) {
      return res.status(400).json({ error: error.message });
    }

    if (error?.code === 'P2025') { // Prisma's error code for record not found on delete
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /users/me/settings:
 *   patch:
 *     summary: Update authenticated user's settings
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               replacementPreference:
 *                 type: string
 *                 enum: [dont_replace, send_request]
 *                 description: User's preference for product replacements during shopping.
 *               measurementUnit:
 *                 type: string
 *                 enum: [imperial, metric]
 *                 description: User's preferred measurement unit.
 *     responses:
 *       200:
 *         description: User settings updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
export const updateUserSettingsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const { replacementPreference, measurementUnit } = req.body;

    const updatedUser = await userService.updateUserSettings(userId, {
      replacementPreference: replacementPreference as ReplacementPreference,
      measurementUnit: measurementUnit as MeasurementUnit,
    });

    res.status(200).json(updatedUser);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to update user settings',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: req.userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'UPDATE_USER_SETTINGS_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    if (error.message.includes('User not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /users/me/delete-account/initiate:
 *   post:
 *     summary: Initiate account deletion for the authenticated user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     description: Sends an OTP to the authenticated user's registered email address to confirm account deletion.
 *     responses:
 *       200:
 *         description: OTP sent successfully to your email.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found or email not registered.
 *       500:
 *         description: Internal server error.
 */
export const initiateAccountDeletionController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    await userService.initiateAccountDeletion(userId);
    res.status(200).json({ message: 'OTP sent successfully to your email. Please check your inbox to confirm account deletion.' });
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to initiate account deletion',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: req.userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'INITIATE_ACCOUNT_DELETION_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    if (error.message.includes('User not found') || error.message.includes('email not registered')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /users/me/delete-account/confirm:
 *   post:
 *     summary: Confirm account deletion for the authenticated user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     description: Confirms account deletion using an OTP sent to the user's email, performing a soft delete upon successful verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp]
 *             properties:
 *               otp: { type: string, description: "The OTP received via email." }
 *     responses:
 *       200:
 *         description: Account soft-deleted successfully.
 *       400:
 *         description: Invalid or expired OTP, or active orders exist.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found or email not registered.
 *       500:
 *         description: Internal server error.
 */
export const confirmAccountDeletionController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const { otp } = req.body;
    const deletedUser = await userService.confirmAccountDeletion(userId, otp);
    res.status(200).json({ message: 'Account soft-deleted successfully.', user: deletedUser });
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to confirm account deletion',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: req.userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'CONFIRM_ACCOUNT_DELETION_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    if (error.message.includes('Invalid or expired OTP') || error.message.includes('active orders')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('User not found') || error.message.includes('email not registered')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};