import { EmailError } from '@application/errors/EmailError';
import { MailServiceError } from '@application/errors/MailServiceError';
import {
   ForgotPasswordEmailField,
   SendEmailUserForgotPasswordEvent,
} from '@application/types/ForgotPasswordEmail';
import { ForgotPasswordPayload } from '@application/types/ForgotPasswordTokenPayload';
import { ENV } from '@config/env';
import { forgotPasswordDTO } from '@dtos/user/forgotPassword.dto';
import { IEmailService } from '@ports/IEmailService';
import { IJWTService } from '@ports/IJWTService';
import { IUserRepository } from '@ports/IUserRepository';

export class ForgotPassword {
   constructor(
      private readonly userRepository: IUserRepository,
      private readonly jwtService: IJWTService,
      private readonly emailService: IEmailService
   ) {}

   execute = async (dto: forgotPasswordDTO): Promise<{ email: string }> => {
      const user = await this.userRepository.retriveUserByEmail(dto.email);

      if (!user) {
         throw new EmailError('Email does not exist');
      }

      const tokenPayload: ForgotPasswordPayload = {
         email: user.email,
      };

      const passwordResetToken = this.jwtService.sign(
         tokenPayload,
         ENV.RESET_PASSWORD_SECRET as string,
         5 * 60
      );

      //  todo: send mail to user email
      const emailData: ForgotPasswordEmailField = {
         token: passwordResetToken,
      };
      const emailEvent: SendEmailUserForgotPasswordEvent = {
         data: emailData,
         email: user.email,
         type: 'user-forgot-password',
      };

      const { ack } = await this.emailService.send(emailEvent);
      if (!ack) {
         throw new MailServiceError(`Error while sending password recovery mail to ${user.email}`);
      }

      return { email: user.email };
   };
}
