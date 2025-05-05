import { OTP } from '@domain/services/otpGenerator';
import { IJWTService } from '@ports/IJWTService';
import { IUserRepository } from '@ports/IUserRepository';
import { IHashService } from '@ports/IHashService';
import { signupUserDTO } from '@dtos/user/signupUser.dto';
import { verifedUserToken } from '@dtos/user/verifyUser.dto';
import { EmailError } from '@application/errors/EmailError';
import {
   SendEmailVerificationEvent,
   UserVerifyEmailDataFields,
} from '@application/types/userVerifyEmail';
import { IEmailService } from '@ports/IEmailService';

export class SignupUser {
   constructor(
      private readonly userRepository: IUserRepository,
      private readonly JWTService: IJWTService,
      private readonly OTPService: OTP,
      private readonly hashService: IHashService,
      private readonly emailService: IEmailService
   ) {}

   execute = async (dto: signupUserDTO): Promise<string> => {
      const isEmailTaken = await this.userRepository.emailExists(dto.email);
      if (isEmailTaken) {
         throw new EmailError('Email already exists');
      }

      const passwordHash = await this.hashService.hash(
         dto.password,
         parseInt(process.env.passwordSalt as string)
      );

      const otp = this.OTPService.generate();
      console.log(`otp ${otp}`);

      const emailData: UserVerifyEmailDataFields = {
         otp,
         firstName: dto.firstName,
      };

      const sendVerificaionMailEvent: SendEmailVerificationEvent = {
         email: dto.email,
         data: emailData,
         type: 'email-verification',
      };

      await this.emailService.send(sendVerificaionMailEvent);

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
