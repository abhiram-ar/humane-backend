import { SendPasswordRecoveryMailInputDTO } from '@dtos/sendPasswordRecoveryMailInput.dto';
import { EmailTemplateMap } from '@infrastructure/mail-service/EmailTemplateMap';
import { IEmailService } from '@ports/IEmailService';

export class SendPasswordRecoveryMail {
   constructor(private readonly _mailService: IEmailService) {}
   execute = async (dto: SendPasswordRecoveryMailInputDTO) => {
      const subject = 'Humane Password recovery';
      const template = EmailTemplateMap.USER_PASSWORD_RECOVERY_TEMPLATE;
      this._mailService.send(dto.email, subject, dto.data, template);
   };
}
