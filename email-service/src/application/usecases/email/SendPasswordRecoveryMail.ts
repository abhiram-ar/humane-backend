import { SendPasswordRecoveryMailInputDTO } from '@dtos/sendPasswordRecoveryMailInput.dto';
import { EmailTemplateMap } from '@infrastructure/mail-service/EmailTemplateMap';
import { IEmailService } from '@ports/IEmailService';
import { ISendPasswordRecoveryMail } from '@ports/usercases/email/ISendPasswordRecoveryMail';

export class SendPasswordRecoveryMail implements ISendPasswordRecoveryMail {
   constructor(private readonly _mailService: IEmailService) {}
   execute = async (dto: SendPasswordRecoveryMailInputDTO): Promise<{ ack: boolean }> => {
      const subject = 'Humane Password recovery';
      const template = EmailTemplateMap.USER_PASSWORD_RECOVERY_TEMPLATE;
      const { ack } = await this._mailService.send(dto.email, subject, dto.data, template);
      return { ack };
   };
}
