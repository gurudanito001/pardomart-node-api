import { PrismaClient, EmailVerification } from '@prisma/client';
import * as emailVerificationModel from '../models/emailVerification.model';
import { sendEmail } from '../utils/email.util'; // Assuming this utility exists

const prisma = new PrismaClient();

export class EmailVerificationError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'EmailVerificationError';
    this.statusCode = statusCode;
  }
}

const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

/**
 * Generates an OTP, stores it, and sends it to the user's email.
 * @param email The user's email address.
 * @param purpose The purpose of the OTP (e.g., "account_deletion", "password_reset").
 * @param subject The subject of the email.
 * @param emailBodyTemplate A function that takes the OTP and returns the email body.
 */
export const generateAndStoreEmailOtp = async (
  email: string,
  purpose: string,
  subject: string,
  emailBodyTemplate: (otp: string) => string
): Promise<void> => {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  await prisma.emailVerification.upsert({
    where: { email },
    create: { email, code: otp, expiresAt, purpose, attempts: 0 },
    update: { code: otp, expiresAt, attempts: 0, purpose },
  });

  // Send email (assuming sendEmail utility exists)
  await sendEmail({
    to: email,
    subject: subject,
    html: emailBodyTemplate(otp),
  });
};

/**
 * Verifies an OTP for a given email and purpose.
 */
export const verifyEmailOtp = async (email: string, otp: string, purpose: string): Promise<EmailVerification> => {
  const verification = await emailVerificationModel.getEmailVerificationByEmailAndPurpose(email, purpose);

  if (!verification || verification.code !== otp || new Date() > verification.expiresAt) {
    throw new EmailVerificationError('Invalid or expired OTP.', 400);
  }
  return verification;
};