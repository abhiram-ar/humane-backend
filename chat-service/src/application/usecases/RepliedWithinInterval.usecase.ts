import { RepliedWithinIntervalUserMsgIngputDTO } from '@application/dto/RepliedWithinInterval.dto';
import { logger } from '@config/logger';
import { Message } from '@domain/Message';
import { IMessageRepository } from '@ports/repository/IMessageRepository';
import { IRepliedWithin } from '@ports/usecases/IRepliedWithinInterval.usecase';
import { format } from 'date-fns';

export class RepliedWithin implements IRepliedWithin {
   constructor(private readonly _messageRepo: IMessageRepository) {}

   interval = async ({
      interval,
      userMsg,
   }: {
      interval: number;
      userMsg: RepliedWithinIntervalUserMsgIngputDTO;
   }): Promise<{ otherUserLastMsg: Required<Message> } | undefined> => {
      const otherUserLastMessage =
         await this._messageRepo.getLastMessageOfOtherUserBeforeThisMessage({
            messageId: userMsg.messageId,
            convoId: userMsg.conversationId,
            sendAt: userMsg.sendAt,
            senderId: userMsg.senderId,
         });
      if (!otherUserLastMessage) {
         logger.debug(`${RepliedWithin.name}: no other user last message`);

         return;
      }

      const sendTimeDelta = userMsg.sendAt.getTime() - otherUserLastMessage.sendAt.getTime();
      // 24hrs
      if (sendTimeDelta > interval) {
         const duration = format(new Date(interval), 'HH:mm:ss');
         logger.debug(
            `${RepliedWithin.name}: other user last message is older than interval period(${duration})`
         );
         return;
      }

      return { otherUserLastMsg: otherUserLastMessage };
   };
}
