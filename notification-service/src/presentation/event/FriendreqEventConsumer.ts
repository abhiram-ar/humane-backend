import { Consumer } from 'kafkajs';
import { AppEvent, AppEventsTypes, MessageBrokerTopics, ZodValidationError } from 'humane-common';
import KafkaSingleton from '@infrastructure/event/KafkaSingleton';
import { logger } from '@config/logger';
import {
   FriendReqNotificationInputDTO,
   friendReqNotificationInputSchema,
} from '@application/dtos/FriendReqNotification.dto';
import { FriendReqNotificationService } from '@application/usercase/FriendReqNotificationService.usecase';
import { io } from '@presentation/websocket/ws';
import { axiosESproxyService } from '@infrastructure/http/axiosESproxy';
import { GetUserBasicDetailsResponse } from './Types/GetUserBasicDetails Response';

export class FriendReqEventConsumer {
   private _consumer: Consumer;
   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _friendReqNotificationService: FriendReqNotificationService
   ) {
      this._consumer = this._kafka.createConsumer('friend-req-event-consumer-7');
   }

   start = async () => {
      await this._consumer.connect();
      logger.info('Friendreq event consumer connected');

      await this._consumer.subscribe({
         topic: MessageBrokerTopics.FRIENDSHIP_EVENTS_TOPIC,
         fromBeginning: true,
      });

      await this._consumer.run({
         eachMessage: async ({ message }) => {
            if (!message.value) {
               throw new Error('No body/value for message');
            }
            const event = JSON.parse(message.value.toString()) as AppEvent;
            logger.verbose(JSON.stringify(event, null, 2));

            const dto = {
               friendship: event.payload,
               eventCreatedAt: event.timestamp,
            } as FriendReqNotificationInputDTO;
            try {
               const parsed = friendReqNotificationInputSchema.safeParse(dto);
               if (!parsed.success) {
                  throw new ZodValidationError(parsed.error);
               }
               // TODO: reafaco
               if (event.eventType === AppEventsTypes.FRIEND_REQ_SENT) {
                  const noti = await this._friendReqNotificationService.create(parsed.data);

                  const reciverSockets = await io.in(noti.reciverId).fetchSockets();

                  if (reciverSockets.length > 0) {
                     const response = await axiosESproxyService.get<GetUserBasicDetailsResponse>(
                        '/api/v1/query/public/user/basic',
                        { params: { userId: noti.actorId } }
                     );

                     const requesterDetails = response.data.data.user[0];
                     if (requesterDetails) {
                        io.to(noti.reciverId).emit('push-noti', {
                           ...noti,
                           actionableUser: requesterDetails,
                        });
                     } else {
                        logger.warn('No requester basic details from ES proxy');
                     }
                  }
                  //
               } else if (event.eventType === AppEventsTypes.FRIEND_REQ_ACCEPTED) {
                  const noti = await this._friendReqNotificationService.updateFriendReqStatus(
                     parsed.data
                  );

                  const reciverSockets = await io.in(noti.reciverId).fetchSockets();
                  if (reciverSockets.length > 0) {
                     const response = await axiosESproxyService.get<GetUserBasicDetailsResponse>(
                        '/api/v1/query/public/user/basic',
                        { params: { userId: noti.actorId } }
                     );

                     const requesterDetails = response.data.data.user[0];
                     if (requesterDetails) {
                        io.to(noti.reciverId).emit('update-noti', {
                           ...noti,
                           actionableUser: requesterDetails,
                        });
                     } else {
                        logger.warn('No requester basic details from ES proxy');
                     }
                  }
                  // TODO: crete new accceted req and write it to requester socket

                  //
               } else if (event.eventType === AppEventsTypes.FRIEND_REQ_CANCELLED) {
                  const noti = await this._friendReqNotificationService.delete(parsed.data);
                  if (noti) io.to(noti.reciverId).emit('remove-noti', noti);
                  //
               } else if (event.eventType === AppEventsTypes.FRIEND_REQ_DECLIED) {
                  const noti = await this._friendReqNotificationService.delete(parsed.data);
                  if (noti) io.to(noti.reciverId).emit('remove-noti', noti);
                  //
               } else if (event.eventType === AppEventsTypes.FRIENDSHIP_DELETED) {
                  const noti = await this._friendReqNotificationService.delete(parsed.data);
                  if (noti) io.to(noti.reciverId).emit('remove-noti', noti);
                  //
               } else {
                  throw new Error(
                     `Invalid event type (${event.eventType}) for notificaion-srv:frendreqNoti consumer`
                  );
               }
               logger.info(`Processed ${event.eventType}: ${event.eventId}`);
            } catch (error) {
               logger.error(`Error while processing ${event.eventId}`);
               logger.error(error);
            }
         },
      });
   };

   stop = async () => {
      await this._consumer.disconnect();
   };
}
