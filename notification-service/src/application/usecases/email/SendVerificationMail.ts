import { SendUserVerificationMailDTO } from '@dtos/sendVerificationMailInput.dto';
import { EmailTemplateMap } from '@infrastructure/mail-service/EmailTemplateMap';
import { IEmailService } from '@ports/IEmailService';

export class SendUserVerificationMail {
   constructor(private readonly _emailService: IEmailService) {}

   execute = async (dto: SendUserVerificationMailDTO): Promise<{ ack: boolean }> => {
      const subject = 'Humane email verification OTP';
      const template = EmailTemplateMap.VERIFY_USER_EMAIL_TEMPLATE;

      const { ack } = await this._emailService.send(dto.email, subject, dto.data, template);

      return { ack };
   };
}
