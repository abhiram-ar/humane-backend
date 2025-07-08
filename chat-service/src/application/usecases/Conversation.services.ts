import { CreateConversationInputDTO } from '@application/dto/CreateConversation.dto';
import { Conversation } from '@domain/Conversation';
import { IConversationRepository } from '@ports/repository/IConversationRepository';

export class ConversationServices {
   constructor(private readonly _conversationRepo: IConversationRepository) {}

   create = async (dto: CreateConversationInputDTO): Promise<Required<Conversation>> => {
      const tempconvo = new Conversation({ participants: dto.participants, type: dto.type });
      return await this._conversationRepo.create(tempconvo);
   };
}
