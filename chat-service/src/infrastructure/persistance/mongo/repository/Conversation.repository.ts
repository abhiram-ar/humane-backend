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

         /* stage 4: extract current users participant info (for clearedAt & lastOpenedAt) */
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

         /* stage 5: lookup latest message (after clearedAt) */
         {
            $lookup: {
               from: 'messages',
               let: {
                  convoId: '$_id',
                  clearedAt: '$currentUser.clearedAt',
               },
               pipeline: [
                  {
                     $match: {
                        $expr: {
                           $and: [
                              { $eq: ['$conversationId', '$$convoId'] },
                              {
                                 $or: [
                                    { $eq: ['$$clearedAt', null] },
                                    { $gt: ['$sendAt', '$$clearedAt'] },
                                 ],
                              },
                           ],
                        },
                     },
                  },
                  { $sort: { sendAt: -1, _id: -1 } },
                  { $limit: 1 },
               ],
               as: 'lastMessage',
            },
         },
         { $unwind: { path: '$lastMessage', preserveNullAndEmptyArrays: true } },

         /* stage 6: lookup unread messages count (respect clearedAt) */
         {
            $lookup: {
               from: 'messages',
               let: {
                  roomId: '$_id',
                  lastSeenAt: '$currentUser.lastOpenedAt',
                  clearedAt: '$currentUser.clearedAt',
               },
               pipeline: [
                  {
                     $match: {
                        $expr: {
                           $and: [
                              { $eq: ['$conversationId', '$$roomId'] },
                              { $ne: ['$senderId', userId] },
                              { $gt: ['$sendAt', { $ifNull: ['$$lastSeenAt', new Date(0)] }] },
                              {
                                 $or: [
                                    { $eq: ['$$clearedAt', null] },
                                    { $gt: ['$sendAt', '$$clearedAt'] },
                                 ],
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

         /* stage 7: flatten unreadCount */
         {
            $addFields: {
               unreadCount: {
                  $ifNull: [{ $arrayElemAt: ['$unreadMeta.unreadCount', 0] }, 0],
               },
            },
         },

         /* stage 8: cleanup */
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

         /** Stage 4: extract current user's participant info (for clearedAt & lastOpenedAt) */
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

         /** Stage 5: lookup latest message (excluding cleared messages) */
         {
            $lookup: {
               from: 'messages',
               let: {
                  convoId: '$_id',
                  clearedAt: '$currentUser.clearedAt',
               },
               pipeline: [
                  {
                     $match: {
                        $expr: {
                           $and: [
                              { $eq: ['$conversationId', '$$convoId'] },
                              {
                                 $or: [
                                    { $eq: ['$$clearedAt', null] },
                                    { $gt: ['$sendAt', '$$clearedAt'] },
                                 ],
                              },
                           ],
                        },
                     },
                  },
                  { $sort: { sendAt: -1, _id: -1 } },
                  { $limit: 1 },
               ],
               as: 'lastMessage',
            },
         },
         { $unwind: { path: '$lastMessage', preserveNullAndEmptyArrays: true } },

         /** Stage 6: lookup unread messages count (respecting clearedAt) */
         {
            $lookup: {
               from: 'messages',
               let: {
                  roomId: '$_id',
                  lastSeenAt: '$currentUser.lastOpenedAt',
                  clearedAt: '$currentUser.clearedAt',
               },
               pipeline: [
                  {
                     $match: {
                        $expr: {
                           $and: [
                              { $eq: ['$conversationId', '$$roomId'] },
                              { $ne: ['$senderId', userId] },
                              { $gt: ['$sendAt', { $ifNull: ['$$lastSeenAt', new Date(0)] }] },
                              {
                                 $or: [
                                    { $eq: ['$$clearedAt', null] },
                                    { $gt: ['$sendAt', '$$clearedAt'] },
                                 ],
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

         /* stage 7: flatten unreadCount */
         {
            $addFields: {
               unreadCount: {
                  $ifNull: [{ $arrayElemAt: ['$unreadMeta.unreadCount', 0] }, 0],
               },
            },
         },

         /* stage 8: cleanup fields */
         {
            $project: {
               unreadMeta: 0,
               currentUser: 0,
            },
         },
      ]);

      return res.map((doc) => conversationWithLastMessageAutoMapper(doc));
   };

   setUserConvoClearedAt = async (
      userId: string,
      convoId: string
   ): Promise<Required<Conversation | null>> => {
      const res = await conversationModel.findOneAndUpdate(
         {
            _id: convoId,
            'participants.userId': userId,
         },
         {
            $set: {
               'participants.$.clearedAt': new Date(), // $ updates the first matching element if there are multiple matches.
            },
         },
         { new: true, timestamps: false }
      );
      return res ? conversationAutomapper(res) : null;
   };
}
