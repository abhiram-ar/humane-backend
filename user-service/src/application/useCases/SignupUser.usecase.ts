import { OTP } from '../../domain/services/otpGenerator';
import { IJWTService } from '../ports/IJWTService';
import { IUserRepository } from '../ports/IUserRepository';
import { IHashService } from '../ports/IHashService';
import { signupUserDTO } from '../DTOs/user/signupUser.dto';
import { verifedUserToken } from '../DTOs/user/verifyUser.dto';

export class SignupUser {
   constructor(
      private readonly userRepository: IUserRepository,
      private readonly JWTService: IJWTService,
      private readonly OTPService: OTP,
      private readonly hashService: IHashService
   ) {}

   execute = async (dto: signupUserDTO): Promise<string> => {
      const isEmailTaken = await this.userRepository.emailExists(dto.email);
      if (isEmailTaken) {
         throw new Error('Email already taken');
      }

      const passwordHash = await this.hashService.hash(
         dto.password,
         parseInt(process.env.passwordSalt as string)
      );

      const otp = this.OTPService.generate();
      const otpHash = await this.hashService.hash(otp, parseInt(process.env.otpSalt as string));

      const userSignupData: verifedUserToken = {
         firstName: dto.firstName,
         lastName: dto.lastName,
         email: dto.email,
         passwordHash,
         otpHash,
      };

      const singUpToken = this.JWTService.sign(
         userSignupData,
         process.env.otpTokenSecret as string,
         5 * 60 * 60
      );

      return singUpToken;
   };
}
