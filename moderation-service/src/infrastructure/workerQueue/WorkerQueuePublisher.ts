import { logger } from '@config/logger';
import amqplib, { ChannelModel, ConfirmChannel } from 'amqplib';
import { AppEvent } from 'humane-common';

export class RabbitMQWorkerQueuePublisher {
   private _connection: ChannelModel | undefined;
   private _publisherChannel: ConfirmChannel | undefined;
   constructor() {}

   connect = async () => {
      this._connection = await amqplib.connect(
         'amqp://default_user_F5IPFQJd2jJ0ZgZXyYI:owQfj94b0JNHne4K3wMIke7r4cqPs94A@humane-rabbitmq'
      );
   };

   disconnect = async () => {
      await this._publisherChannel?.close();
      this._publisherChannel = undefined;
      await this._connection?.close();
      this._connection = undefined;
   };

   getPublisherChan = async (): Promise<ConfirmChannel | null> => {
      if (!this._connection) return null;
      if (!this._publisherChannel) {
         this._publisherChannel = await this._connection.createConfirmChannel();
      }
      return this._publisherChannel;
   };

   addToQueue = async (dto: { queueName: string; data: AppEvent }): Promise<{ ack: boolean }> => {
      const publiserChan = await this.getPublisherChan();
      if (!publiserChan) return { ack: false };

      await publiserChan.assertQueue(dto.queueName, { durable: true });

      const res: Promise<{ ack: boolean }> = new Promise((res, rej) => {
         publiserChan.sendToQueue(
            dto.queueName,
            Buffer.from(JSON.stringify(dto.data)),
            { persistent: true },
            (err, _) => {
               if (err) {
                  logger.error(err);
                  return rej({ ack: false });
               }
               res({ ack: true });
            }
         );
      });

      return await res;
   };
}
