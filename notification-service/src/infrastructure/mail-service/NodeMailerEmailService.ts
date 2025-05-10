import ejs from 'ejs';
import nodeMailer from 'nodemailer';
import path from 'path';
import { IEmailService } from '@ports/out/IEmailService';

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
         const templatePath = path.join('/app/src/infrastructure/service/mails', template);
         const html: string = await ejs.renderFile(templatePath, data);

         const mailOptions = {
            from: process.env.SMTP_MAIL as string,
            to: email,
            subject: subject,
            html,
         };

         this.transporter.sendMail(mailOptions);
         return { ack: true };
      } catch (error) {
         console.log('error while sending mail', error);
         return { ack: false };
      }
   };
}
