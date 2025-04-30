import { JWTService } from '../../infrastructure/service/JWTService';
import { verifedUserToken, verifyUserDTO } from '../DTOs/user/verifyUser.dto';
import { IUserRepository } from '../ports/IUserRepository';

export class VerifyUser {
   constructor(
      private readonly userRepository: IUserRepository,
      private readonly JWT: JWTService
   ) {}

   execute = async (
      dto: verifyUserDTO
   ): Promise<{ firstName: string; lastName?: string; email: string }> => {
      const verifiedUser = this.JWT.verify<verifedUserToken>(
         dto.activationToken,
         process.env.otpTokenSecret as string
      );

      const newUser = await this.userRepository.create(verifiedUser);
      return newUser;
   };
}
