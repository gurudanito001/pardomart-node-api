// utils/verification.ts
import nodemailer from 'nodemailer';

export const generateVerificationCode = (): string => {
  //return '123456'
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

export const sendVerificationCode = async (mobileNumber: string, verificationCode: string, email?: string): Promise<void> => {
    console.log(`Processing verification for ${mobileNumber}`);

    if (email) {
        try {
            let transporter;

            // Check if real SMTP credentials are provided in environment variables
            if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
                console.log('Initializing production SMTP transporter...');
                transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: Number(process.env.SMTP_PORT) || 587,
                    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });
            } else {
                // Fallback to Ethereal for development if no real SMTP is configured
                console.log('SMTP environment variables not set. Falling back to Ethereal transport.');
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
            }

            // send mail with defined transport object
            const info = await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Pardomart Support" <no-reply@pardomart.com>', // sender address
                to: email, // list of receivers
                subject: "Your Verification Code", // Subject line
                text: `Your verification code is: ${verificationCode}`, // plain text body
                html: `<b>Your verification code is: ${verificationCode}</b>`, // html body
            });

            console.log("Message sent: %s", info.messageId);
            // Preview only available when sending through an Ethereal account
            if (nodemailer.getTestMessageUrl(info)) {
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            }
        } catch (error) {
            console.error("Error sending email verification:", error);
            throw error;
        }
    }
    // SMS logic would go here
};