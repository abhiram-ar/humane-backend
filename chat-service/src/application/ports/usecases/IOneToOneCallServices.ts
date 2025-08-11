import { CreateOneToOneCallInputDTO } from '@application/dto/CreateOneToOneCall.dto';
import { Conversation } from '@domain/Conversation';
import { Message } from '@domain/Message';

export interface IOneToOneCallServices {
   create(
      dto: CreateOneToOneCallInputDTO
   ): Promise<{ callMessage: Required<Message>; convo: Required<Conversation> }>;

   callTaken(dto: { callId: string }): Promise<Required<Message> | null>;
}
