import ejs from 'ejs';
import nodeMailer from 'nodemailer';
import path from 'path';
import { IEmailService } from '@ports/IEmailService';
import { logger } from '@config/logger';

export class NodeMailerEmailService implements IEmailService {
   private transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT as string),
      service: process.env.SMTP_SERVICE,
      auth: {
         user: process.env.SMTP_MAIL,
         pass: process.env.SMTP_PASSWORD,
      },
   });

   constructor() {}

   send = async (
      email: string,
      subject: string,
      data: any,
      template: string
   ): Promise<{ ack: boolean }> => {
      try {
         const templatePath = path.join(__dirname, './mails/', template);
         const html: string = await ejs.renderFile(templatePath, data);

         const mailOptions = {
            from: process.env.SMTP_MAIL as string,
            to: email,
            subject: subject,
            html,
         };

         await this.transporter.sendMail(mailOptions);
         return { ack: true };
      } catch (error) {
         logger.error('error while sending mail', { error });
         return { ack: false };
      }
   };
}
