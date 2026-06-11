// controllers/auth.controller.ts
import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import * as userService from '../services/user.service'
import { generateVerificationCode, sendVerificationCode } from '../utils/verification'; // Create this file.
import Timezones from '../utils/timezones';
import { Prisma, PrismaClient } from '@prisma/client';
import { errorLogService } from '../services/errorLog.service';

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
      //await sendVerificationCode(newUser?.mobileNumber, verificationCode, newUser?.email);
    });

    res.status(201).json({ message: 'Verification code sent' });
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to register user',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'USER_REGISTRATION_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // This is the Prisma error code for a unique constraint violation
        return res.status(409).json({
          message: 'A user with this mobile number and role already exists.',
        });
      }
    }
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
    let allUtcs: string[] = [];
    timezones.forEach(zone => {
      allUtcs = [...allUtcs, ...zone.utc];
    });
    const uniqueAndSortedUtcs = Array.from(new Set(allUtcs)).sort();
    res.status(200).json({ message: 'List of time zones', data: uniqueAndSortedUtcs });
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to get time zones',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'GET_TIME_ZONES_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Country:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The common name of the country.
 *           example: "Nigeria"
 *         iso2:
 *           type: string
 *           description: The ISO 3166-1 alpha-2 country code.
 *           example: "NG"
 *         dialCode:
 *           type: string
 *           description: The country's international calling code (e.g., +234).
 *           example: "+234"
 *         flagPng:
 *           type: string
 *           format: uri
 *           description: URL to the country's flag in PNG format.
 *           nullable: true
 *         flagSvg:
 *           type: string
 *           format: uri
 *           description: URL to the country's flag in SVG format.
 *           nullable: true
 * /auth/static-countries:
 *   get:
 *     summary: Get a list of static country data
 *     tags: [General]
 *     description: Returns a list of simplified country objects (name, iso2, dialCode, flagPng, flagSvg) from a local static file. This endpoint is completely open and does not require authentication.
 *     responses:
 *       200:
 *         description: A list of static country data, sorted alphabetically by name.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Country'
 *       500:
 *         description: Internal server error.
 */
/**
 * Controller to retrieve a list of static country data from the local utility.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON array of simplified country objects.
 */
export const getStaticCountries = async (req: Request, res: Response) => {
  try {
    const countriesData = authService.getStaticCountriesData();
    res.status(200).json(countriesData);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to get static countries data',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'GET_STATIC_COUNTRIES_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /auth/countries:
 *   get:
 *     summary: Get countries from Rest Countries API
 *     tags: [General]
 *     description: Returns a list of countries or searches for a specific one. This endpoint is completely open.
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Optional search term (e.g., 'canada').
 *     responses:
 *       200:
 *         description: A list of countries.
 *       500:
 *         description: Internal server error.
 */
export const getCountries = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const countries = await authService.getCountriesFromRestCountries(search as string);
    res.status(200).json(countries);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to get countries',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'GET_COUNTRIES_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

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
      //await sendVerificationCode(mobileNumber, verificationCode, user.email);
    });

    // Return the actual role found for the user
    res.status(200).json({ success: true, role: user.role });
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to initiate login',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'INITIATE_LOGIN_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

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
    await errorLogService.logError({
      message: error.message || 'Failed to verify code and login',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'VERIFY_LOGIN_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    if (error instanceof authService.AuthError) {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};