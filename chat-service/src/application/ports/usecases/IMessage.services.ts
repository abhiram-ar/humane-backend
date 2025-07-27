import { DeleteUserMessageInputDTO } from '@application/dto/DeleteUserMessage.dto';
import { Message } from '@domain/Message';

export interface IMessageService {
   deleteUserMessage(dto: DeleteUserMessageInputDTO): Promise<Required<Message>>;
}
