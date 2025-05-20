import { IEventPublisher } from '@ports/IEventProducer';
import { JWTService } from '../../../infrastructure/service/JWTService';
import { verifedUserToken, verifyUserDTO } from '../../DTOs/user/verifyUser.dto';
import { OTPError } from '../../errors/OTPError';
import { IHashService } from '../../ports/IHashService';
import { IUserRepository } from '../../ports/IUserRepository';
import { AppEventsTypes, createEvent, KafkaTopics, UserCreatedEventPayload } from 'humane-common';
import { EventBusError } from '@application/errors/EventbusError';

export class VerifyUser {
   constructor(
      private readonly _userRepository: IUserRepository,
      private readonly _JWT: JWTService,
      private readonly _hashService: IHashService,

      private readonly _eventPubliser: IEventPublisher
   ) {}

   execute = async (
      dto: verifyUserDTO
   ): Promise<{ firstName: string; lastName?: string; email: string }> => {
      let verifiedUser: verifedUserToken;

      try {
         verifiedUser = this._JWT.verify<verifedUserToken>(
            dto.activationToken,
            process.env.otpTokenSecret as string
         );
      } catch (error) {
         throw new OTPError('OTP token expires/Invalid');
      }

      const validHash = await this._hashService.compare(dto.activationCode, verifiedUser.otpHash);
      if (!validHash) {
         throw new OTPError('OTP does not match');
      }

      const newUser = await this._userRepository.create(verifiedUser);

      const eventPayload: UserCreatedEventPayload = {
         id: newUser.id,
         firstName: newUser.firstName,
         email: newUser.email,
         lastName: newUser.lastName || null,
         createdAt: new Date().toUTCString(),
         isBlocked: newUser.isBlocked,
         isHotUser: newUser.isHotUser,
      };

      const userCreatedEvent = createEvent(AppEventsTypes.USER_CREATED, eventPayload);
      const { ack } = await this._eventPubliser.send(
         KafkaTopics.USER_PROFILE_EVENTS_TOPIC,
         userCreatedEvent
      );

      if (!ack) {
         throw new EventBusError('failed to send user created Event');
      }

      return newUser;
   };
}
