// utils/verification.ts

import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

export const generateVerificationCode = (): string => {
  return '123456'
  //return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

export const sendVerificationCode = async (mobileNumber: string, verificationCode: string, email?: string): Promise<void> => {
    console.log(`Processing verification for ${mobileNumber}`);

    if (email) {
        try {
            // Prioritize SendGrid if API key is available (recommended for production)
            if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
                console.log('Initializing SendGrid transporter...');
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                const msg = {
                    to: email,
                    from: process.env.SENDGRID_FROM_EMAIL, // Important: Use a verified sender email/domain
                    subject: 'Your Verification Code',
                    text: `Your verification code is: ${verificationCode}`,
                    html: `<b>Your verification code is: ${verificationCode}</b>`,
                };
                await sgMail.send(msg);
                console.log("Message sent successfully via SendGrid.");
            
            } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
                // Fallback to generic SMTP
                console.log('Initializing generic SMTP transporter...');
                let transporter;
                transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: Number(process.env.SMTP_PORT) || 587,
                    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });
                const info = await transporter.sendMail({
                    from: process.env.SMTP_FROM || '"Pardomart Support" <no-reply@pardomart.com>', // sender address
                    to: email, // list of receivers
                    subject: "Your Verification Code", // Subject line
                    text: `Your verification code is: ${verificationCode}`, // plain text body
                    html: `<b>Your verification code is: ${verificationCode}</b>`, // html body
                });
                console.log("Message sent: %s", info.messageId);

            } else {
                // Fallback to Ethereal for development if no real SMTP is configured
                console.log('SendGrid/SMTP environment variables not set. Falling back to Ethereal transport.');
                let transporter;
                const testAccount = await nodemailer.createTestAccount();
                transporter = nodemailer.createTransport({
                    host: "smtp.ethereal.email",
                    port: 587,
                    secure: false,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass,
                    },
                });
                const info = await transporter.sendMail({
                    from: '"Pardomart Support" <no-reply@pardomart.com>', // sender address
                    to: email, // list of receivers
                    subject: "Your Verification Code", // Subject line
                    text: `Your verification code is: ${verificationCode}`, // plain text body
                    html: `<b>Your verification code is: ${verificationCode}</b>`, // html body
                });
                console.log("Message sent: %s", info.messageId);
                if (nodemailer.getTestMessageUrl(info)) {
                    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                }
            }
        } catch (error: any) {
            console.error("Error sending email verification:", error);
            if (error.response) {
              console.error('SendGrid Error Body:', error.response.body);
            }
            throw error;
        }
    }
    // SMS logic would go here
};