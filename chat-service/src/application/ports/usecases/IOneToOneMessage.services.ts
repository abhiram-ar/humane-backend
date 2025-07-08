import { CreateOneToOneMessageInputDTO } from '@application/dto/CreateOneToOneMessage.dto';
import { Message } from '@domain/Message';

export interface IOneToOneMessageServices {
   create(dto: CreateOneToOneMessageInputDTO): Promise<Required<Message>>;
}
