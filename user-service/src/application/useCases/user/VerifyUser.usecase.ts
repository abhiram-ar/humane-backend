import { JWTService } from '../../../infrastructure/service/JWTService';
import { verifedUserToken, verifyUserDTO } from '../../DTOs/user/verifyUser.dto';
import { OTPError } from '../../errors/OTPError';
import { IHashService } from '../../ports/IHashService';
import { IUserRepository } from '../../ports/IUserRepository';

export class VerifyUser {
   constructor(
      private readonly userRepository: IUserRepository,
      private readonly JWT: JWTService,
      private readonly hashService: IHashService
   ) {}

   execute = async (
      dto: verifyUserDTO
   ): Promise<{ firstName: string; lastName?: string; email: string }> => {
      let verifiedUser: verifedUserToken;

      try {
         verifiedUser = this.JWT.verify<verifedUserToken>(
            dto.activationToken,
            process.env.otpTokenSecret as string
         );
      } catch (error) {
         throw new OTPError('OTP token expires/Invalid');
      }

      const validHash = await this.hashService.compare(dto.activationCode, verifiedUser.otpHash);
      if (!validHash) {
         throw new OTPError('OTP does not match');
      }

      const newUser = await this.userRepository.create(verifiedUser);
      return newUser;
   };
}
