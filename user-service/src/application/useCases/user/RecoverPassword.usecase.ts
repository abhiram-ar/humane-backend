import { JWTError } from '@application/errors/JWTError';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { ForgotPasswordPayload } from '@application/types/ForgotPasswordTokenPayload';
import { ENV } from '@config/env';
import { recoverPasswordDTO } from '@dtos/user/recoverPassword.dto';
import { IHashService } from '@ports/IHashService';
import { IJWTService } from '@ports/IJWTService';
import { IUserRepository } from '@ports/IUserRepository';

export class RecoverPassword {
   constructor(
      private readonly userRepository: IUserRepository,
      private readonly jwtService: IJWTService,
      private readonly hashService: IHashService
   ) {}

   execute = async (dto: recoverPasswordDTO) => {
      let payload: ForgotPasswordPayload;
      try {
         payload = this.jwtService.verify<ForgotPasswordPayload>(
            dto.recoveryToken,
            ENV.RESET_PASSWORD_SECRET as string
         );
      } catch (error) {
         throw new JWTError('Invalid/Expired recovery token');
      }

      const hashedPassword = await this.hashService.hash(
         dto.newPassword,
         parseInt(ENV.PASSWORD_SALT as string)
      );

      const userUpdate = await this.userRepository.changePassword(payload.email, hashedPassword);
      if (!userUpdate) {
         throw new UserNotFoundError('Email does not exist');
      }

      return { email: userUpdate.email };
   };
}
