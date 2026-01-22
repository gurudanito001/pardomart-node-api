import { Request, Response } from 'express';
import * as userService from '../services/user.service'; // Assuming you have a user.service.ts file
import { User, Role } from '@prisma/client'; // Import User type
import { GetUserFilters } from '../models/user.model';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

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
 *         dynamicMediaUrls: { type: object, nullable: true }
 *         active: { type: boolean }
 *         language: { type: string, nullable: true }
 *         notification: { type: object, nullable: true }
 *         rememberToken: { type: string, nullable: true }
 *         stripeCustomerId: { type: string, nullable: true }
 *         referralCode: { type: string, nullable: true }
 *         role: { $ref: '#/components/schemas/Role' }
 *         vendorId: { type: string, format: uuid, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
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
 *         language: { type: string }
 *         notification: { type: object }
 *         referralCode: { type: string }
 */
export const getAllUsers = async (req: Request, res: Response) => {
  // express-validator has already sanitized and converted types
  const { mobileVerified, active, role, language, page, size, search } = req.query;

  const filters: GetUserFilters & { search?: string } = {
    mobileVerified: mobileVerified as boolean | undefined,
    active: active as boolean | undefined,
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
  } catch (error) {
    console.error('Error getting all users:', error);
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
    console.error('Error creating admin:', error);
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
    console.error('Error updating admin:', error);
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
    console.error('Error deactivating admin:', error);
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
  } catch (error) {
    console.error('Error getting admin stats:', error);
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
  } catch (error) {
    console.error('Error exporting admins:', error);
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
  } catch (error) {
    console.error('Error getting all verification codes:', error);
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
  } catch (error) {
    console.error('Error getting user by ID:', error);
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
  } catch (error) {
    console.error('Error creating user:', error);
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
    console.error('Error updating user:', error);
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user to delete.
 *     responses:
 *       200:
 *         description: The deleted user.
 *       404:
 *         description: User not found.
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const deletedUser = await userService.deleteUser(userId);
    res.status(200).json(deletedUser);
  } catch (error: any) {
    console.error('Error deleting user:', error);
    if (error?.code === 'P2025') { // Prisma's error code for record not found on delete
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};