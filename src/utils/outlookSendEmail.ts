var nodemailer = require('nodemailer');
import config from "../config/config";

interface optionsData {
  host: string,
  port: number,
  secure: boolean,
  auth: {user: string, pass: string},
  from: string,
  to: string,
  cc?: string,
  bcc?: string,
  subject: string,
  html: string,
  text: string,
  replyTo?: string,
  attachments?: {filename: string, content: string}[],
  tls?: any,
  onError?: (err: any)=>void,
  onSuccess?: (res: any)=>void
}


module.exports.sendEmail = function (options: optionsData) {
    if(!options){
        throw new Error("Options can not be null");
    } else if(!options.auth) {
        throw new Error("Options.auth{user,pass} can not be null");
    } else if(!options.auth.user || !options.auth.pass) {
        throw new Error("Options.auth.user or Options.auth.pass cannot be null");

    }
    var transporter = nodemailer.createTransport({
        name: "danielnwokocha",
        host: options.host || 'smtp.office365.com', // Office 365 server
        port: options.port || 587,     // secure SMTP
        auth: options.auth,
        //tls: options.tls || {ciphers: 'SSLv3'}
    });
    transporter.sendMail({
        from: options.from,
        //sender: options.sender,
        replyTo: options.replyTo,
        to: options.to,
        subject: options.subject,
        cc:options.cc,
        bcc:options.bcc,
        text:options.text,
        html:options.html,
        attachments:options.attachments,
    }, function (err: any, info: any) {
        if (err && options.onError) {
            options.onError(err);
        }
        else if(options.onSuccess) {
            options.onSuccess(info);
        }
    });
}