import KafkaSingleton from '@infrastructure/event-bus/KafkaSingleton';
import { Consumer } from 'kafkajs';
import { SendUserVerificationMail } from '@application/usecases/email/SendVerificationMail';
import { IConsumer, MessageBrokerTopics, UserSignupEvent } from 'humane-common';
import {
   SendUserVerificationMailDTO,
   sendUserVerificationMailInputSchema,
} from '@dtos/sendVerificationMailInput.dto';

export class UserSingupEventConsumer implements IConsumer {
   private _consumer: Consumer;
   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _handleSingupMailSend: SendUserVerificationMail
   ) {
      this._consumer = this._kafka.createConsumer('user-signup-mail-group-1');
   }

   start = async () => {
      await this._consumer.connect();
      console.log('User signup consumer connected');

      await this._consumer.subscribe({ topic: MessageBrokerTopics.USER_SINGUP_EVENTS_TOPIC });

      await this._consumer.run({
         eachMessage: async ({ message }) => {
            if (!message.value) {
               throw new Error('No body/value for message');
            }
            const event = JSON.parse(message.value.toString()) as UserSignupEvent;

            const dto: SendUserVerificationMailDTO = {
               email: event.payload.email,
               data: event.payload.data,
            };

            const parsed = sendUserVerificationMailInputSchema.safeParse(dto);
            if (!parsed.success) {
               throw new Error('Invalid dto to send user verification mail');
            }

            await this._handleSingupMailSend.execute(parsed.data);
            console.log(`veififaction mail send to ${dto.email}`);
         },
      });
   };

   stop = async () => {
      await this._consumer.disconnect();
   };
}
