import { RepliedWithin24HrsInputDTO } from '@application/dto/RepliedWithin24Hrs.dto';
import { logger } from '@config/logger';
import { IMessageRepository } from '@ports/repository/IMessageRepository';
import { IEventPublisher } from '@ports/services/IEventProducer';
import { AppEventsTypes, createEvent, MessageBrokerTopics } from 'humane-common';
import { FirstReplyWithin24HrEventPayload } from 'humane-common/build/events/chat-service-events';

export class RepliedWithin24Hrs {
   constructor(
      private readonly _messageRepo: IMessageRepository,
      private readonly _eventPublisher: IEventPublisher
   ) {}

   execute = async (userMsg: RepliedWithin24HrsInputDTO): Promise<void> => {
      // check if user already rewared in last 24hr in cache - if yes return

      // retrive the message send by other user in last 24hr - if no messag exist return
      const otherUserLastMessage =
         await this._messageRepo.getLastMessageOfOtherUserBeforeThisMessage({
            messageId: userMsg.messageId,
            convoId: userMsg.conversationId,
            sendAt: userMsg.sendAt,
            senderId: userMsg.senderId,
         });
      if (!otherUserLastMessage) {
         logger.debug(`${RepliedWithin24Hrs.name}: no other user last message`);

         return;
      }

      const sendTimeDelta = userMsg.sendAt.getTime() - otherUserLastMessage.sendAt.getTime();
      // 24hrs
      if (sendTimeDelta > 86400000) {
         logger.debug(`${RepliedWithin24Hrs.name}: other user last message is older than 24hrs`);
         return;
      }

      const firstReplyWithin24HrEvent: FirstReplyWithin24HrEventPayload = {
         messageId: userMsg.messageId,
         senderId: userMsg.senderId,
         conversationId: userMsg.conversationId,
         sendAt: userMsg.sendAt,
         repliedToUserId: otherUserLastMessage.senderId,
         message: userMsg.message,
      };
      const firstReplyWithin24HrEventPayload = createEvent(
         AppEventsTypes.FIRST_REPLY_WITHIN_24_HR,
         firstReplyWithin24HrEvent
      );

      const { ack } = await this._eventPublisher.send(
         MessageBrokerTopics.MESSAGE_SPECAIAL_EVENTS_TOPIC,
         firstReplyWithin24HrEventPayload
      );
      if (!ack) return;

      // add entry to cache
   };
}
