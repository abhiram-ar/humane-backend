import { ENV } from '@config/env';
import { logger } from '@config/logger';
import amqplib, { ChannelModel, ConfirmChannel } from 'amqplib';
import { AppEvent } from 'humane-common';

export class RabbitMQWorkerQueuePublisher {
   private _connection: ChannelModel | undefined;
   private _publisherChannel: ConfirmChannel | undefined;
   private _forceConnClosed: boolean = false; // just to keep not on how the connection closed, was it manual or forced
   constructor() {}

   connect = async () => {
      this._forceConnClosed = false;
      this._connection = await amqplib.connect(ENV.RABBITMQ_CONNECTION_STRING as string, {
         timeout: 10 * 60 * 1000,
      });
      this._connection.on('close', () => {
         if (this._forceConnClosed) return;
         process.nextTick(() => {
            logger.debug('next tick rabbimq conn fired');
            this.connect();
         });
      });
   };

   disconnect = async () => {
      this._forceConnClosed = true;
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
