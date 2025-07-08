import { CreateConversationInputDTO } from '@application/dto/CreateConversation.dto';
import { Conversation } from '@domain/Conversation';
import { IConversationRepository } from '@ports/repository/IConversationRepository';
import { IConversationServices } from '@ports/usecases/IConversationServices';

export class ConversationServices implements IConversationServices {
   constructor(private readonly _conversationRepo: IConversationRepository) {}

   create = async (dto: CreateConversationInputDTO): Promise<Required<Conversation>> => {
      const tempconvo = new Conversation({
         participants: dto.participants,
         type: dto.type,
         groupName: dto.groupName,
         groupPicKey: dto.groupPicKey,
      });
      return await this._conversationRepo.create(tempconvo);
   };

   getConversationByParticipantIds = async (
      userIds: string[]
   ): Promise<Required<Conversation> | null> => {
      if (userIds.length === 0) return null;

      // TODO: read through cache

      return await this._conversationRepo.getOneToOneConversationByParticipantIds(userIds);
   };
}
