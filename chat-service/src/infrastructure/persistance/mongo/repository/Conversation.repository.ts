import { Conversation, conversationTypes } from '@domain/Conversation';
import { IConversationRepository } from '@ports/repository/IConversationRepository';
import conversationModel from '../models/conversation.model';
import { conversationAutomapper } from '../automapper/conversation.automapper';

export class ConversataionRepository implements IConversationRepository {
   getOneToOneConversationByParticipantIds = async (
      userIds: string[]
   ): Promise<Required<Conversation> | null> => {
      const res = await conversationModel.findOne({
         type: conversationTypes.ONE_TO_ONE,
         'participants.userId': { $all: userIds },
         'participants.2': { $exists: false }, // 2nd index does not exits, this ensure that we have atmost 2 user participants
      });

      if (!res) return null;

      return conversationAutomapper(res);
   };
   create = async (entity: Conversation): Promise<Required<Conversation>> => {
      const res = await conversationModel.create({
         participants: entity.participants,
         type: entity.type,
         groupName: entity.groupName,
         groupPicKey: entity.groupPicKey,
      });
      return conversationAutomapper(res);
   };
   delete = async (entity: Conversation): Promise<Required<Conversation> | null> => {
      const res = await conversationModel.findOneAndDelete({ type: entity.type, _id: entity.id });
      if (!res) return null;
      return conversationAutomapper(res);
   };
}
