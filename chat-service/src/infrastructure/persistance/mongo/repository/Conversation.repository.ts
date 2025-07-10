import { Conversation, conversationTypes } from '@domain/Conversation';
import { IConversationRepository } from '@ports/repository/IConversationRepository';
import conversationModel, { IConversationDocument } from '../models/conversation.model';
import { conversationAutomapper } from '../automapper/conversation.automapper';
import { FilterQuery } from 'mongoose';
import {
   ConversationWithLastMessage,
   conversationWithLastMessageAutoMapper,
} from '../automapper/conversationWithLastMessageAutomapper';
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
   getUserConversations = async (
      userId: string,
      from: string | null,
      limit: number
   ): Promise<{
      conversations: ConversationWithLastMessage[];
      from: string | null;
      hasMore: boolean;
   }> => {
      const [fromUpdatedAt, fromId] = from ? from.split('|') : [];

      const formFilter: FilterQuery<IConversationDocument> | undefined = from
         ? {
              $or: [
                 { updatedAt: { $lt: fromUpdatedAt } },
                 { updatedAt: { $lte: fromUpdatedAt }, id: { $lt: fromId } },
              ],
           }
         : undefined;

      const res = await conversationModel
         .find({
            'participants.userId': userId,
            ...formFilter,
         })
         .sort({ updatedAt: -1, _id: -1 })
         .limit(limit)
         .populate('lastMessageId');

      const lastEntry = res.at(-1);
      const newFrom = lastEntry
         ? lastEntry.updatedAt.toISOString() + '|' + String(lastEntry._id)
         : null;

      return {
         conversations: res.map((doc) => conversationWithLastMessageAutoMapper(doc)),
         from: newFrom,
         hasMore: res.length === limit,
      };
   };
}
