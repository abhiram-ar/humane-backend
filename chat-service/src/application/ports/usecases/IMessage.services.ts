import { DeleteUserMessageInputDTO } from '@application/dto/DeleteUserMessage.dto';
import { Message } from '@domain/Message';

export interface IMessageService {
   softDeleteUserMessage(dto: DeleteUserMessageInputDTO): Promise<Required<Message>>;
}
