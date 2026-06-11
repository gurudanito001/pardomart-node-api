import * as Nodemailer from 'nodemailer';

interface SendVerificationEmailParams {
    email: string,
    code: string,
    title?: string,
    message?: string,
    buttonText?: string
}

interface SendNotificationEmailParams {
  to: string;
  subject: string;
  html: string;
  meta?: object; // Optional metadata for logging or context
}

export async function sendVerificationEmail({ email, code, title= "Verify Email", message = "verify your email address"  }: SendVerificationEmailParams ) : Promise<any> {

    let transporter = Nodemailer.createTransport({
        name: "Loose Application",  //www.agronigeria.ng
        host: "smtp.zoho.com",  //mail.agronigeria.ng smtp-mail.outlook.com
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.email_username, //no-reply@agronigeria.ng
          pass: process.env.email_password, //AgroNigA!!en90
        },
      });
    
    // setup e-mail data, even with unicode symbols
    var mailOptions = {
        from: process.env.email_username,
        to: `${email}`,
        subject: `${title}`,
        text: `Use this code to ${message}`,
        html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center;">
            <h3>Loose Application Onboarding Verification Code</h3>
            <p>A verification code is needed to continue the Onboarding process</p>
            
            <h1> ${code} </h1>

            <p> This code will expire in 30 minutes </p>
            <p style="line-height: 1.3rem;">
            Thanks <br />
            <em>The Loose App Team</em>
            </p>
        </div>
        `
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
    
        console.log('Message sent: ' + info.response);
    });

}

export async function sendNotificationEmail({ to, subject, html, meta }: SendNotificationEmailParams): Promise<any> {
    let transporter = Nodemailer.createTransport({
        name: "Pardomart Notifications",
        host: "smtp.zoho.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.email_username,
            pass: process.env.email_password,
        },
    });

    const mailOptions = {
        from: process.env.email_username,
        to: to,
        subject: subject,
        html: html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Notification email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending notification email:', error);
        throw error;
    }
}
