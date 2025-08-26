// controllers/auth.controller.ts
import { Request, Response } from 'express';
import * as authService from '../services/auth.service'; // Create this file
import * as userService from '../services/user.service'
import { generateVerificationCode, sendVerificationCode } from '../utils/verification'; // Create this file.
import Timezones from '../utils/timezones';


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
 *               - mobileNumber
 *               - role
 *             properties:
 *               mobileNumber:
 *                 type: string
 *                 description: The user's mobile number in E.164 format.
 *                 example: "+1234567890"
 *               role:
 *                 type: string
 *                 description: The role for the new user.
 *                 enum: [CUSTOMER, VENDOR_ADMIN, SHOPPER_STAFF]
 *     responses:
 *       201:
 *         description: Verification code sent successfully.
 *       500:
 *         description: Internal server error.
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const newUser = await userService.createUser(req.body);

    const verificationCode = generateVerificationCode();
    await authService.storeVerificationCode(newUser?.mobileNumber, verificationCode);
    await sendVerificationCode(newUser?.mobileNumber, verificationCode);

    res.status(201).json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /auth/getTimeZones:
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
 * /auth/resendVerification:
 *   post:
 *     summary: Resend verification code
 *     tags: [Auth]
 *     description: Resends a verification code to a user's mobile number if the user exists.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InitiateLogin'
 *     responses:
 *       200:
 *         description: Verification code resent successfully.
 *       404:
 *         description: User not found.
 */
export const resendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { mobileNumber, role } = req.body;

    // Check if the user exists
    const userExists = await authService.checkUserExistence({ mobileNumber, role });
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const verificationCode = generateVerificationCode();
    await authService.storeVerificationCode(mobileNumber, verificationCode);
    await sendVerificationCode(mobileNumber, verificationCode);

    res.status(200).json({ message: 'Verification code resent' });
  } catch (error) {
    console.error('Error resending verification code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /auth/initiateLogin:
 *   post:
 *     summary: Initiate user login
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
 *                 example: "+1234567890"
 *               role:
 *                 type: string
 *                 enum: [CUSTOMER, VENDOR_ADMIN, SHOPPER_STAFF]
 *                 example: "CUSTOMER"
 *     responses:
 *       200:
 *         description: Returns whether the user exists and sends a verification code if they do.
 */
export const initiateLogin = async (req: Request, res: Response) => {
  try {
    const { mobileNumber, role } = req.body;
    const userExists = await authService.checkUserExistence({ mobileNumber, role });

    if (!userExists) {
      return res.status(200).json({ exists: false });
    }

    const verificationCode = generateVerificationCode();
    await authService.storeVerificationCode(mobileNumber, verificationCode);
    await sendVerificationCode(mobileNumber, verificationCode);

    res.status(200).json({ exists: true });
  } catch (error) {
    console.error('Error initiating login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /auth/verifyAndLogin:
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
 *                 example: "+1234567890"
 *               verificationCode:
 *                 type: string
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 enum: [CUSTOMER, VENDOR_ADMIN, SHOPPER_STAFF]
 *                 example: "CUSTOMER"
 *     responses:
 *       200:
 *         description: Login successful, returns user object with token.
 *       401:
 *         description: Invalid verification code or code has expired.
 */
export const verifyCodeAndLogin = async (req: Request, res: Response) => {
  try {
    const { mobileNumber, verificationCode, role } = req.body;
    const user = await authService.verifyCodeAndLogin(mobileNumber, verificationCode, role);

    if (!user) {
      return res.status(401).json({ error: 'Invalid verification' });
    }
    // TODO: Handle error when the code has expired
    res.status(200).json(user); // user object containing token.
  } catch (error) {
    console.error('Error verifying code and logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};