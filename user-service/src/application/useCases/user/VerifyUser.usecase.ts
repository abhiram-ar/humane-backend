import { IEventPublisher } from '@ports/IEventProducer';
import { verifedUserToken, verifyUserDTO } from '../../DTO-mapper/user/verifyUser.dto';
import { OTPError } from '../../errors/OTPError';
import { IHashService } from '../../ports/IHashService';
import { IUserRepository } from '../../ports/IUserRepository';
import {
   AppEventsTypes,
   createEvent,
   MessageBrokerTopics,
   UserCreatedEventPayload,
} from 'humane-common';
import { EventBusError } from '@application/errors/EventbusError';
import { IVerifyUser } from '@ports/usecases/user/IVerifyUser.usecase';
import { IJWTService } from '@ports/IJWTService';

export class VerifyUser implements IVerifyUser {
   constructor(
      private readonly _userRepository: IUserRepository,
      private readonly _JWT: IJWTService,
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
         lastName: newUser.lastName || null,
         createdAt: newUser.createdAt,
         isBlocked: newUser.isBlocked,
         isHotUser: newUser.isHotUser,
         bio: newUser.bio ?? null,
         avatarKey: newUser.avatarKey ?? null,
         coverPhotoKey: newUser.coverPhotoKey ?? null,
         lastLoginTime: newUser.lastLoginTime ?? null,
         humaneScore: newUser.humaneScore,
      };

      const userCreatedEvent = createEvent(AppEventsTypes.USER_CREATED, eventPayload);
      const { ack } = await this._eventPubliser.send(
         MessageBrokerTopics.USER_PROFILE_EVENTS_TOPIC,
         userCreatedEvent
      );

      if (!ack) {
         throw new EventBusError('failed to send user created Event');
      }

      return {
         firstName: newUser.firstName,
         lastName: newUser.lastName ?? undefined,
         email: newUser.email,
      };
   };
}
