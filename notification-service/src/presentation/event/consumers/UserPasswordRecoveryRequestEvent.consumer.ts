import { SendPasswordRecoveryMail } from '@application/usecases/email/SendPasswordRecoveryMail';
import KafkaSingleton from '@infrastructure/event-bus/KafkaSingleton';
import { KafkaTopics, UserPasswordRecoveryRequestEvent } from 'humane-common';
import { Consumer } from 'kafkajs';
import {
   SendPasswordRecoveryMailInputDTO,
   sendPasswordRecoveryMailInputSchema,
} from '@dtos/sendPasswordRecoveryMailInput.dto';

export class UserPasswordRecoveryRequestEventConsumer {
   private consumer: Consumer;

   constructor(
      private readonly _sendPasswordRecoveryMail: SendPasswordRecoveryMail,
      private readonly _kafka: KafkaSingleton
   ) {
      this.consumer = this._kafka.createConsumer('email-group-1');
   }

   start = async () => {
      await this.consumer.connect();
      console.log('User password recovery event consumer connected ');

      await this.consumer.subscribe({ topic: KafkaTopics.USER_PASSWORD_RECOVERY_EVENTS_TOPIC });

      await this.consumer.run({
         eachMessage: async ({ message }) => {
            console.log('got new messsage: userPassowrd recovery');

            const event = JSON.parse(
               (message.value as Buffer<ArrayBufferLike>).toString()
            ) as UserPasswordRecoveryRequestEvent;

            const dto: SendPasswordRecoveryMailInputDTO = {
               email: event.payload.email,
               data: event.payload.data,
            };

            const parsed = sendPasswordRecoveryMailInputSchema.safeParse(dto);
            if (!parsed.success) {
               throw new Error('invalid event payload to password recovery email');
            }

            await this._sendPasswordRecoveryMail.execute(parsed.data);
            console.log(`event handled: mail send to ${dto.email}`);
         },
      });
   };

   stop = async () => {
      await this.consumer.disconnect();
   };
}
