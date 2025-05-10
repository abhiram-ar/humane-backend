import { EmailError } from '@application/errors/EmailError';
import { EventBusError } from '@application/errors/EventbusError';
import { ForgotPasswordPayload } from '@application/types/ForgotPasswordTokenPayload';
import { ENV } from '@config/env';
import { forgotPasswordDTO } from '@dtos/user/forgotPassword.dto';
import { IEventPublisher } from '@ports/IEventProducer';
import { IJWTService } from '@ports/IJWTService';
import { IUserRepository } from '@ports/IUserRepository';
import { UserPasswordRecoveryEventPaylaod, createEvent, AppEventsTypes, KafkaTopics } from 'humane-common';

export class ForgotPassword {
   constructor(
      private readonly _userRepository: IUserRepository,
      private readonly _jwtService: IJWTService,
      private readonly _eventPublisher: IEventPublisher
   ) {}

   execute = async (dto: forgotPasswordDTO): Promise<{ email: string }> => {
      const user = await this._userRepository.retriveUserByEmail(dto.email);

      if (!user) {
         throw new EmailError('Email does not exist');
      }

      const tokenPayload: ForgotPasswordPayload = {
         email: user.email,
      };

      const passwordResetToken = this._jwtService.sign(
         tokenPayload,
         ENV.RESET_PASSWORD_SECRET as string,
         5 * 60
      );

      //  todo: send mail to user email
      const passwordRecoveryEventPayload: UserPasswordRecoveryEventPaylaod = {
         email: user.email,
         data: {
            token: passwordResetToken,
         },
      };

      const passwordRevoveryEvent = createEvent(
         AppEventsTypes.USER_PASSWORD_RECOVERY_REQUESTED,
         passwordRecoveryEventPayload
      );

      const { ack } = await this._eventPublisher.send(
         KafkaTopics.USER_PASSWORD_RECOVERY_EVENTS_TOPIC,
         passwordRevoveryEvent
      );
      if (!ack) {
         throw new EventBusError(`Error while sending password recovery mail to ${user.email}`);
      }

      return { email: user.email };
   };
}
