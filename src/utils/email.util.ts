export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Mock email sending function.
 * In a real application, this would use a service like Nodemailer or an API like SendGrid.
 * For now, it logs the email content to the console for demonstration purposes.
 *
 * @param payload The email payload containing recipient, subject, and HTML body.
 */
export const sendEmail = async (payload: EmailPayload): Promise<void> => {
  console.log('--- Sending Mock Email ---');
  console.log(`To: ${payload.to}`);
  console.log(`Subject: ${payload.subject}`);
  console.log('Body (HTML):');
  console.log(payload.html);
  console.log('--- End Mock Email ---');
};

