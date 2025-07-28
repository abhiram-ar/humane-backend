import { DeleteUserMessageInputDTO } from '@application/dto/DeleteUserMessage.dto';
import { MessageNotFoundError } from '@application/errors/MessageNotFoundError';
import { Message } from '@domain/Message';
import { IMessageRepository } from '@ports/repository/IMessageRepository';
import { IMessageService } from '@ports/usecases/IMessage.services';

export class MessageService implements IMessageService {
   constructor(private readonly _messageRepository: IMessageRepository) {}

   softDeleteUserMessage = async (dto: DeleteUserMessageInputDTO): Promise<Required<Message>> => {
      const deltedMessage = await this._messageRepository.softDeleteUserMessageById(dto);
      if (!deltedMessage) throw new MessageNotFoundError();
      return deltedMessage;
   };
}
