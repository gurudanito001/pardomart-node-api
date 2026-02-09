// controllers/auth.controller.ts
import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import * as userService from '../services/user.service'
import { generateVerificationCode, sendVerificationCode } from '../utils/verification'; // Create this file.
import Timezones from '../utils/timezones';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Creates a new user account and sends a verification code to their mobile number.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - mobileNumber
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's full name.
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 description: The user's email address.
 *                 format: email
 *                 example: "john.doe@example.com"
 *               mobileNumber:
 *                 type: string
 *                 description: The user's mobile number in E.164 format.
 *                 example: "+1234567890"
 *               role:
 *                 type: string
 *                 description: The role for the new user.
 *                 enum: [customer, vendor, store_admin, store_shopper, delivery_person, admin]
 *                 example: "customer"
 *               vendorId:
 *                 type: string
 *                 description: "Required if role is 'store_shopper'. The ID of the vendor this staff member belongs to."
 *                 example: "clq1z2x3y4a5b6c7d8e9f0g1h"
 *     responses:
 *       201:
 *         description: Verification code sent successfully.
 *       500:
 *         description: Internal server error.
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    await prisma.$transaction(async (tx) => {
      const newUser = await userService.createUser(req.body, tx);

      const verificationCode = generateVerificationCode();
      await authService.storeVerificationCode(newUser?.mobileNumber, verificationCode, tx);
      await sendVerificationCode(newUser?.mobileNumber, verificationCode, newUser?.email);
    });

    res.status(201).json({ message: 'Verification code sent' });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // This is the Prisma error code for a unique constraint violation
        return res.status(409).json({
          message: 'A user with this mobile number and role already exists.',
        });
      }
    }
    console.error('Error registering user:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /auth/time-zones:
 *   get:
 *     summary: Get a list of all supported timezones
 *     tags: [General]
 *     description: Returns a flat list of UTC timezone strings.
 *     responses:
 *       200:
 *         description: A list of timezones.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "List of time zones"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "UTC-11"
 */
export const getTimeZones = async (req: Request, res: Response) => {
  try {
    const timezones = Timezones;
    let utcs: string[] = [];
    timezones.forEach( zone =>{
      utcs = [...utcs, ...zone.utc ];
    });
    res.status(200).json({ message: 'List of time zones', data: utcs });
  } catch (error) {
    console.error('Error getting timezones:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /auth/initiate-login:
 *   post:
 *     summary: Initiate user login or resend verification code
 *     tags: [Auth]
 *     description: Checks if a user exists with the given mobile number and role. If they exist, a verification code is sent to their mobile number.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobileNumber
 *               - role
 *             properties:
 *               mobileNumber:
 *                 type: string
 *                 example: "+2348140715723"
 *               role:
 *                 type: string
 *                 enum: [customer, vendor, store_admin, store_shopper, delivery_person, admin]
 *                 example: "customer"
 *     responses:
 *       200:
 *         description: Verification code sent successfully. The actual role of the user is returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 role:
 *                   $ref: '#/components/schemas/Role'
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
export const initiateLogin = async (req: Request, res: Response) => {
  try {
    const { mobileNumber, role } = req.body; // role can be 'vendor' generically
    const user = await authService.findUserForLogin(mobileNumber, role);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await prisma.$transaction(async (tx) => {
      const verificationCode = generateVerificationCode();
      await authService.storeVerificationCode(mobileNumber, verificationCode, tx);
      await sendVerificationCode(mobileNumber, verificationCode, user.email);
    });

    // Return the actual role found for the user
    res.status(200).json({ success: true, role: user.role });
  } catch (error) {
    console.error('Error initiating login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /auth/verify-login:
 *   post:
 *     summary: Verify code and log in
 *     tags: [Auth]
 *     description: Verifies the provided code for the given mobile number and role, and returns a JWT token upon successful verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobileNumber
 *               - verificationCode
 *               - role
 *             properties:
 *               mobileNumber:
 *                 type: string
 *                 example: "+2348140715723"
 *               verificationCode:
 *                 type: string
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 enum: [customer, vendor, store_admin, store_shopper, delivery_person, admin]
 *                 example: "customer"
 *     responses:
 *       200:
 *         description: Login successful, returns user object with token.
 *       401:
 *         description: Invalid verification code or code has expired.
 *       500:
 *         description: Internal server error.
 */
export const verifyCodeAndLogin = async (req: Request, res: Response) => {
  try {
    const { mobileNumber, verificationCode, role } = req.body;
    const result = await authService.verifyCodeAndLogin(mobileNumber, verificationCode, role);
    res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof authService.AuthError) {
      return res.status(401).json({ error: error.message });
    }
    console.error('Error verifying code and logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};