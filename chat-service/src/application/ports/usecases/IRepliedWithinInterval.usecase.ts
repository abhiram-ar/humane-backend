import { RepliedWithinIntervalUserMsgIngputDTO } from '@application/dto/RepliedWithinInterval.dto';
import { Message } from '@domain/Message';

export interface IRepliedWithin {
   interval(dto: {
      interval: number;
      userMsg: RepliedWithinIntervalUserMsgIngputDTO;
   }): Promise<{ otherUserLastMsg: Required<Message> } | undefined>;
}
