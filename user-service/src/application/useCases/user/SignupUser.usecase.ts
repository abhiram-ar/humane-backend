import { OTP } from '@domain/services/otpGenerator';
import { IJWTService } from '@ports/IJWTService';
import { IUserRepository } from '@ports/IUserRepository';
import { IHashService } from '@ports/IHashService';
import { signupUserDTO } from '@dtos/user/signupUser.dto';
import { verifedUserToken } from '@dtos/user/verifyUser.dto';
import { EmailError } from '@application/errors/EmailError';
import { IEventPublisher } from '@application/ports/IEventProducer';
import { UserSignupEventPayload, createEvent, AppEventsTypes, KafkaTopics } from 'humane-common';
import { EventBusError } from '@application/errors/EventbusError';

export class SignupUser {
   constructor(
      private readonly _userRepository: IUserRepository,
      private readonly _JWTService: IJWTService,
      private readonly _OTPService: OTP,
      private readonly _hashService: IHashService,
      private readonly _eventPublisher: IEventPublisher
   ) {}

   execute = async (dto: signupUserDTO): Promise<string> => {
      const isEmailTaken = await this._userRepository.emailExists(dto.email);
      if (isEmailTaken) {
         throw new EmailError('Email already exists');
      }

      const passwordHash = await this._hashService.hash(
         dto.password,
         parseInt(process.env.passwordSalt as string)
      );

      const otp = this._OTPService.generate();
      console.log(`otp ${otp}`);

      const userSignuoEventPayload: UserSignupEventPayload = {
         email: dto.email,
         data: {
            otp,
            firstName: dto.firstName,
         },
      };

      const verifyUserEvent = createEvent(AppEventsTypes.USER_SINGUP, userSignuoEventPayload);

      const { ack } = await this._eventPublisher.send(
         KafkaTopics.USER_SINGUP_EVENTS_TOPIC,
         verifyUserEvent
      );
      if (!ack) {
         throw new EventBusError(`Unable to send mail to ${dto.email}`);
      }

      const otpHash = await this._hashService.hash(otp, parseInt(process.env.otpSalt as string));

      const userSignupData: verifedUserToken = {
         firstName: dto.firstName,
         lastName: dto.lastName,
         email: dto.email,
         passwordHash,
         otpHash,
      };

      const singUpToken = this._JWTService.sign(
         userSignupData,
         process.env.otpTokenSecret as string,
         5 * 60 * 60
      );

      return singUpToken;
   };
}
