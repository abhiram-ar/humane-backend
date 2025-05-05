import { EmailError } from '@application/errors/EmailError';
import { ForgotPasswordPayload } from '@application/types/ForgotPasswordTokenPayload';
import { ENV } from '@config/env';
import { forgotPasswordDTO } from '@dtos/user/forgotPassword.dto';
import { IJWTService } from '@ports/IJWTService';
import { IUserRepository } from '@ports/IUserRepository';

export class ForgotPassword {
   constructor(
      private readonly userRepository: IUserRepository,
      private readonly jwtService: IJWTService
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

      return { email: user.email };
   };
}
