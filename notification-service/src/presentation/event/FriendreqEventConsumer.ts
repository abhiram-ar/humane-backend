import { Consumer } from 'kafkajs';
import {
   AppEvent,
   AppEventsTypes,
   EventConsumerMissMatchError,
   IConsumer,
   MessageBrokerTopics,
   ZodValidationError,
} from 'humane-common';
import KafkaSingleton from '@infrastructure/event/KafkaSingleton';
import { logger } from '@config/logger';
import {
   FriendReqNotificationInputDTO,
   friendReqNotificationInputSchema,
} from '@application/dtos/FriendReqNotification.dto';
import { FriendReqNotificationService } from '@application/usercase/FriendReqNotificationService.usecase';
import { io } from '@presentation/websocket/ws';
import { FriendReqAcceptedNotificationService } from '@application/usercase/FriendReqAcceptedNotificationService.usercase';
import { isUserOnline } from '@presentation/websocket/utils/isUserOnline';
import { IElasticSearchProxyService } from '@ports/IElasticSearchProxyService';

export class FriendReqEventConsumer implements IConsumer {
   private _consumer: Consumer;
   constructor(
      private readonly _kafka: KafkaSingleton,
      private readonly _friendReqNotificationService: FriendReqNotificationService,
      private readonly _friendReqAcceptedNotificationService: FriendReqAcceptedNotificationService,
      private readonly _elasticSearchProxyService: IElasticSearchProxyService
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

                  if (await isUserOnline(noti.reciverId)) {
                     const [requesterDetails] =
                        await this._elasticSearchProxyService.getUserBasicDetails(noti.actorId);

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
                  const updatedFriendReqNoti =
                     await this._friendReqNotificationService.updateFriendReqStatus(parsed.data);

                  if (await isUserOnline(updatedFriendReqNoti.reciverId)) {
                     const [requesterDetails] =
                        await this._elasticSearchProxyService.getUserBasicDetails(
                           updatedFriendReqNoti.actorId
                        );

                     if (requesterDetails) {
                        io.to(updatedFriendReqNoti.reciverId).emit('update-noti', {
                           ...updatedFriendReqNoti,
                           actionableUser: requesterDetails,
                        });
                     } else {
                        logger.warn('No requester basic details from ES proxy');
                     }
                  }

                  // also write accepted freind req to requester notificaions
                  const reqAcceptedNoti = await this._friendReqAcceptedNotificationService.create(
                     parsed.data
                  );

                  if (await isUserOnline(reqAcceptedNoti.reciverId)) {
                     const [friendReqAcceptedUserDetails] =
                        await this._elasticSearchProxyService.getUserBasicDetails(
                           reqAcceptedNoti.actorId
                        );

                     if (friendReqAcceptedUserDetails) {
                        io.to(reqAcceptedNoti.reciverId).emit('push-noti', {
                           ...reqAcceptedNoti,
                           actionableUser: friendReqAcceptedUserDetails,
                        });
                     } else {
                        logger.warn('No req accepted user basic details from ES proxy');
                     }
                  }

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
                  if (noti && (await isUserOnline(noti.reciverId)))
                     io.to(noti.reciverId).emit('remove-noti', noti);

                  const reqAcceptedNoti = await this._friendReqAcceptedNotificationService.delete(
                     parsed.data
                  );
                  if (reqAcceptedNoti && (await isUserOnline(reqAcceptedNoti.reciverId))) {
                     io.to(reqAcceptedNoti.reciverId).emit('remove-noti', reqAcceptedNoti);
                  }
                  //
               } else {
                  throw new EventConsumerMissMatchError();
               }
               logger.info(`Processed ${event.eventType}: ${event.eventId}`);
            } catch (error) {
               logger.error(`Error while processing ${event.eventId}`, { error });
            }
         },
      });
   };

   stop = async () => {
      await this._consumer.disconnect();
   };
}
