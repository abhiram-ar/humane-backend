import { RepliedWithin24HrsInputDTO } from '@application/dto/RepliedWithin24Hrs.dto';
import { logger } from '@config/logger';
import { IMessageRepository } from '@ports/repository/IMessageRepository';
import { IEventPublisher } from '@ports/services/IEventProducer';
import { AppEventsTypes, createEvent, MessageBrokerTopics } from 'humane-common';

export class RepliedWithin24Hrs {
   constructor(
      private readonly _messageRepo: IMessageRepository,
      private readonly _eventPublisher: IEventPublisher
   ) {}

   execute = async (dto: RepliedWithin24HrsInputDTO): Promise<void> => {
      // check if user already rewared in last 24hr in cache - if yes return

      // retrive the message send by other user in last 24hr - if no messag exist return
      const otherUserLastMessage =
         await this._messageRepo.getLastMessageOfOtherUserBeforeThisMessage({
            messageId: dto.messageId,
            convoId: dto.conversationId,
            sendAt: dto.sendAt,
            senderId: dto.senderId,
         });
      if (!otherUserLastMessage) {
         logger.debug(`${RepliedWithin24Hrs.name}: no other user last message`);

         return;
      }

      const sendTimeDelta = dto.sendAt.getTime() - otherUserLastMessage.sendAt.getTime();
      // 24hrs
      if (sendTimeDelta > 86400000) {
         logger.debug(`${RepliedWithin24Hrs.name}: other user last message is older than 24hrs`);
         return;
      }

      // publish rewarable event,
      const firstReplyWithin24HrEventPayload = createEvent(
         AppEventsTypes.FIRST_REPLY_WITHIN_24_HR,
         dto
      );

      const { ack } = await this._eventPublisher.send(
         MessageBrokerTopics.MESSAGE_SPECAIAL_EVENTS_TOPIC,
         firstReplyWithin24HrEventPayload
      );
      if (!ack) return;

      // add entry to cache
   };
}
