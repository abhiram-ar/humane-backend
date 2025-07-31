import { RepliedWithin24HrsInputDTO } from '@application/dto/RepliedWithin24Hrs.dto';
import { Message } from '@domain/Message';

export interface IRepliedWithin24Hrs {
   execute(
      userMsg: RepliedWithin24HrsInputDTO
   ): Promise<{ otherUserLastMsg: Required<Message> } | undefined>;
}
