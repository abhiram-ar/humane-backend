import { IEmailService } from '@ports/IEmailService';
import ejs from 'ejs';
import nodeMailer from 'nodemailer';
import path from 'path';
import { SentEmailEvent } from '@application/types/SentEmailEvent.type';
import { SendEmailVerificationEvent } from '@application/types/userVerifyEmail';

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

   send = async (event: SentEmailEvent<any, any>): Promise<{ ack: boolean }> => {
      try {
         //  const { email, subject, template, data } =

         if (event.type === 'email-verification') {
            const typedEvent = event as SendEmailVerificationEvent;
            const templatePath = path.join(
               '/app/src/infrastructure/service/mails',
               'userEmailVerification.ejs'
            );
            const html = await ejs.renderFile(templatePath, typedEvent.data);

            const mailOptions = {
               from: process.env.SMTP_MAIL as string,
               to: typedEvent.email,
               subject: 'Humane email verification',
               html,
            };

            this.transporter.sendMail(mailOptions);
            return { ack: true };
         }

         return { ack: false };
      } catch (error) {
         console.log('error while sending mail', error);
         return { ack: false };
      }
   };
}
