import { RepliedWithin24HrsInputDTO } from '@application/dto/RepliedWithin24Hrs.dto';
import { logger } from '@config/logger';
import { Message } from '@domain/Message';
import { IMessageRepository } from '@ports/repository/IMessageRepository';
import { IRepliedWithin24Hrs } from '@ports/usecases/IRepliedWithin24Hrs.usecase';

export class RepliedWithin24Hrs implements IRepliedWithin24Hrs {
   constructor(private readonly _messageRepo: IMessageRepository) {}

   execute = async (
      userMsg: RepliedWithin24HrsInputDTO
   ): Promise<{ otherUserLastMsg: Required<Message> } | undefined> => {
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

      return { otherUserLastMsg: otherUserLastMessage };
   };
}
