import { UserBlockedError } from '@application/errors/UserBlockedError';
import { googleAuthDTO } from '@dtos/user/googleAuth.dto';
import { IUserRepository } from '@ports/IUserRepository';
import { IJWTService } from '@ports/IJWTService';
import { ENV } from '@config/env';
import { JWT_ACCESS_TOKEN_EXPIRY_SECONDS, JWT_REFRESH_TOKEN_EXPIRY_SECONDS } from '@config/jwt';
import { UserJWTTokenPayload } from '@application/types/JWTTokenPayload.type';
import {
   AppEventsTypes,
   createEvent,
   MessageBrokerTopics,
   UserCreatedEventPayload,
} from 'humane-common';
import { IEventPublisher } from '@ports/IEventProducer';
import { EventBusError } from '@application/errors/EventbusError';
import { IUserGoogleAuth } from '@ports/usecases/user/IGoogleAuth.usecase';

export class UserGoogleAuth implements IUserGoogleAuth {
   constructor(
      private readonly _userRepository: IUserRepository,
      private readonly _jetService: IJWTService,
      private readonly _eventPublisher: IEventPublisher
   ) {}

   execute = async (dto: googleAuthDTO): Promise<{ accessToken: string; refreshToken: string }> => {
      let user = await this._userRepository.retriveUserByEmail(dto.email);

      if (!user) {
         user = await this._userRepository.googleAuthCreate(dto);

         const eventPayload: UserCreatedEventPayload = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName || null,
            createdAt: new Date().toISOString(),
            isBlocked: user.isBlocked,
            isHotUser: user.isHotUser,
            bio: user.bio ?? null,
            avatarKey: user.avatar ?? null,
            coverPhotoKey: user.coverPhoto ?? null,
            lastLoginTime: user.lastLoginTime ?? null,
            humaneScore: user.humaneScore,
         };

         const userCreatedEvent = createEvent(AppEventsTypes.USER_CREATED, eventPayload);
         const { ack } = await this._eventPublisher.send(
            MessageBrokerTopics.USER_PROFILE_EVENTS_TOPIC,
            userCreatedEvent
         );

         if (!ack) {
            throw new EventBusError('failed to send user created Event');
         }
      }

      if (user.isBlocked) {
         throw new UserBlockedError('User is blocked, cannot do social auth');
      }

      const tokenPayload: UserJWTTokenPayload = {
         userId: user.id,
         type: 'user',
         iss: 'humane',
      };

      const accessToken = this._jetService.sign(
         tokenPayload,
         ENV.ACCESS_TOKEN_SECRET as string,
         JWT_ACCESS_TOKEN_EXPIRY_SECONDS
      );

      const refreshToken = this._jetService.sign(
         tokenPayload,
         ENV.REFRESH_TOKEN_SECRET as string,
         JWT_REFRESH_TOKEN_EXPIRY_SECONDS
      );

      return { accessToken, refreshToken };
   };
}
