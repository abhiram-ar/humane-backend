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
   getConversationById = async (converstionId: string): Promise<Required<Conversation> | null> => {
      const result = await conversationModel.findById(converstionId);
      if (!result) return null;
      return conversationAutomapper(result);
   };

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
         : {};

      const res = await conversationModel.aggregate([
         {
            $match: {
               'participants.userId': userId,
               ...formFilter,
            },
         },
         {
            $sort: { updatedAt: -1, _id: -1 },
         },
         { $limit: limit },

         // Stage 4: lookup the latest message
         {
            $lookup: {
               from: 'messages',
               localField: 'lastMessageId',
               foreignField: '_id',
               as: 'lastMessage',
            },
         },
         { $unwind: { path: '$lastMessage', preserveNullAndEmptyArrays: true } },

         // Stage 5: add current users lastSeenAt to top-level (for easy lookup)
         {
            $addFields: {
               currentUser: {
                  $first: {
                     $filter: {
                        input: '$participants',
                        as: 'p',
                        cond: { $eq: ['$$p.userId', userId] },
                     },
                  },
               },
            },
         },

         // Stage 6: lookup unread messages for each conversation
         {
            $lookup: {
               from: 'messages',
               let: {
                  roomId: '$_id',
                  lastSeenAt: '$currentUser.lastOpenedAt',
               },
               pipeline: [
                  {
                     $match: {
                        $expr: {
                           $and: [
                              { $eq: ['$conversationId', '$$roomId'] },
                              { $ne: ['$senderId', userId] },
                              {
                                 $gt: ['$sendAt', { $ifNull: ['$$lastSeenAt', new Date(0)] }],
                              },
                           ],
                        },
                     },
                  },
                  { $count: 'unreadCount' },
               ],
               as: 'unreadMeta',
            },
         },

         // Stage 7: flatten unreadCount
         {
            $addFields: {
               unreadCount: {
                  $ifNull: [{ $arrayElemAt: ['$unreadMeta.unreadCount', 0] }, 0],
               },
            },
         },

         // optional: clean up
         {
            $project: {
               unreadMeta: 0,
               currentUser: 0,
            },
         },
      ]);

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

   setUserLastOpenedAt = async (
      conversationId: string,
      userId: string,
      time: Date
   ): Promise<void> => {
      await conversationModel.updateOne(
         { _id: conversationId, 'participants.userId': userId },
         { $set: { 'participants.$.lastOpenedAt': time } },
         { timestamps: false }
      );
   };

   getUserConversationById = async (
      userId: string,
      convoId: string
   ): Promise<Required<Conversation> | null> => {
      const res = await conversationModel.findOne({ _id: convoId, 'participants.userId': userId });

      return res ? conversationAutomapper(res) : null;
   };

   findManyUserOneToOneConvoByParticipantIds = async (
      userId: string,
      otherUserIds: string[],
      limit: number
   ): Promise<ConversationWithLastMessage[]> => {
      if (otherUserIds.length === 0) return [];

      const res = await conversationModel.aggregate([
         {
            $match: {
               type: conversationTypes.ONE_TO_ONE,
               $and: [
                  { 'participants.userId': userId },
                  { 'participants.userId': { $in: otherUserIds } },
               ],
            },
         },
         {
            $sort: { updatedAt: -1, _id: -1 },
         },
         { $limit: limit },

         // Stage 4: lookup the latest message
         {
            $lookup: {
               from: 'messages',
               localField: 'lastMessageId',
               foreignField: '_id',
               as: 'lastMessage',
            },
         },
         { $unwind: { path: '$lastMessage', preserveNullAndEmptyArrays: true } },

         // Stage 5: add current users lastSeenAt to top-level (for easy lookup)
         {
            $addFields: {
               currentUser: {
                  $first: {
                     $filter: {
                        input: '$participants',
                        as: 'p',
                        cond: { $eq: ['$$p.userId', userId] },
                     },
                  },
               },
            },
         },

         // Stage 6: lookup unread messages for each conversation
         {
            $lookup: {
               from: 'messages',
               let: {
                  roomId: '$_id',
                  lastSeenAt: '$currentUser.lastOpenedAt',
               },
               pipeline: [
                  {
                     $match: {
                        $expr: {
                           $and: [
                              { $eq: ['$conversationId', '$$roomId'] },
                              { $ne: ['$senderId', userId] },
                              {
                                 $gt: ['$sendAt', { $ifNull: ['$$lastSeenAt', new Date(0)] }],
                              },
                           ],
                        },
                     },
                  },
                  { $count: 'unreadCount' },
               ],
               as: 'unreadMeta',
            },
         },

         // Stage 7: flatten unreadCount
         {
            $addFields: {
               unreadCount: {
                  $ifNull: [{ $arrayElemAt: ['$unreadMeta.unreadCount', 0] }, 0],
               },
            },
         },

         // optional: clean up
         {
            $project: {
               unreadMeta: 0,
               currentUser: 0,
            },
         },
      ]);

      return res.map((doc) => conversationWithLastMessageAutoMapper(doc));
   };
}
