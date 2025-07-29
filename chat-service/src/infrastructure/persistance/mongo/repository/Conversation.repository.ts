import { Conversation, conversationTypes } from '@domain/Conversation';
import { IConversationRepository } from '@ports/repository/IConversationRepository';
import conversationModel from '../models/conversation.model';
import { conversationAutomapper } from '../automapper/conversation.automapper';
import mongoose from 'mongoose';
import {
   ConversationWithLastMessage,
   conversationWithLastMessageAutoMapper,
} from '../automapper/conversationWithLastMessageAutomapper';
import convoUserMetadataModel from '../models/convoUserMetadata.model';
import { convoUserMetaAutomapper } from '../automapper/convoUserMeta.automapper';
import { ConvoUserMetadata } from '@domain/ConvoUserMetadata';
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
      const fromDate = fromUpdatedAt ? new Date(fromUpdatedAt) : null;
      const fromObjectId = fromId ? new mongoose.Types.ObjectId(fromId) : null;
      console.log(from, fromUpdatedAt, fromId);

      const res = await conversationModel.aggregate([
         // Stage 1: Match conversations where user is a participant
         { $match: { 'participants.userId': userId } },

         // Stage 2: Lookup frequently changing metadata
         {
            $lookup: {
               from: 'convofreqchangingmetadatas',
               localField: '_id',
               foreignField: 'convoId',
               as: 'freqMeta',
            },
         },
         { $unwind: { path: '$freqMeta', preserveNullAndEmptyArrays: true } },

         // Stage 3: Lookup user-specific metadata
         {
            $lookup: {
               from: 'conovusermetadatas',
               let: { convoId: '$_id' },
               pipeline: [
                  {
                     $match: {
                        $expr: {
                           $and: [{ $eq: ['$convoId', '$$convoId'] }, { $eq: ['$userId', userId] }],
                        },
                     },
                  },
               ],
               as: 'userMeta',
            },
         },
         { $unwind: { path: '$userMeta', preserveNullAndEmptyArrays: true } },

         // Stage 4: Compute effective updatedAt
         {
            $addFields: {
               effectiveUpdatedAt: {
                  $cond: {
                     if: { $ifNull: ['$freqMeta.updatedAt', false] },
                     then: '$freqMeta.updatedAt',
                     else: '$createdAt',
                  },
               },
            },
         },

         // Stage 5: Apply cursor filter AFTER metadata join
         ...(from
            ? [
                 {
                    $match: {
                       $or: [
                          { effectiveUpdatedAt: { $lt: fromDate } },
                          {
                             effectiveUpdatedAt: fromDate,
                             _id: { $lt: fromObjectId },
                          },
                       ],
                    },
                 },
              ]
            : []),

         // Stage 6: Proper sorting
         { $sort: { effectiveUpdatedAt: -1, _id: -1 } },

         // Stage 7: Limit +1 to check for more items
         { $limit: limit },

         // Stage 8: Lookup last message
         {
            $lookup: {
               from: 'messages',
               let: {
                  convoId: '$_id',
                  clearedAt: '$userMeta.clearedAt',
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

         // Stage 9: Calculate unread count
         {
            $lookup: {
               from: 'messages',
               let: {
                  convoId: '$_id',
                  lastOpenedAt: '$userMeta.lastOpenedAt',
                  clearedAt: '$userMeta.clearedAt',
               },
               pipeline: [
                  {
                     $match: {
                        $expr: {
                           $and: [
                              { $eq: ['$conversationId', '$$convoId'] },
                              { $ne: ['$senderId', userId] },
                              { $gt: ['$sendAt', { $ifNull: ['$$lastOpenedAt', new Date(0)] }] },
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
         {
            $addFields: {
               unreadCount: { $ifNull: [{ $arrayElemAt: ['$unreadMeta.unreadCount', 0] }, 0] },
               updatedAt: '$effectiveUpdatedAt',
            },
         },

         // Cleanup temporary fields
         {
            $project: {
               effectiveUpdatedAt: 0,
               freqMeta: 0,
               userMeta: 0,
               unreadMeta: 0,
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
         // Stage 2: Lookup frequently changing metadata
         {
            $lookup: {
               from: 'convofreqchangingmetadatas',
               localField: '_id',
               foreignField: 'convoId',
               as: 'freqMeta',
            },
         },
         { $unwind: { path: '$freqMeta', preserveNullAndEmptyArrays: true } },

         // Stage 3: Lookup user-specific metadata
         {
            $lookup: {
               from: 'conovusermetadatas',
               let: { convoId: '$_id' },
               pipeline: [
                  {
                     $match: {
                        $expr: {
                           $and: [{ $eq: ['$convoId', '$$convoId'] }, { $eq: ['$userId', userId] }],
                        },
                     },
                  },
               ],
               as: 'userMeta',
            },
         },
         { $unwind: { path: '$userMeta', preserveNullAndEmptyArrays: true } },

         // Stage 4: Compute effective updatedAt
         {
            $addFields: {
               effectiveUpdatedAt: {
                  $cond: {
                     if: { $ifNull: ['$freqMeta.updatedAt', false] },
                     then: '$freqMeta.updatedAt',
                     else: '$createdAt',
                  },
               },
            },
         },

         // Stage 6: Proper sorting
         { $sort: { effectiveUpdatedAt: -1, _id: -1 } },

         // Stage 7: Limit +1 to check for more items
         { $limit: limit },

         // Stage 8: Lookup last message
         {
            $lookup: {
               from: 'messages',
               let: {
                  convoId: '$_id',
                  clearedAt: '$userMeta.clearedAt',
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

         // Stage 9: Calculate unread count
         {
            $lookup: {
               from: 'messages',
               let: {
                  convoId: '$_id',
                  lastOpenedAt: '$userMeta.lastOpenedAt',
                  clearedAt: '$userMeta.clearedAt',
               },
               pipeline: [
                  {
                     $match: {
                        $expr: {
                           $and: [
                              { $eq: ['$conversationId', '$$convoId'] },
                              { $ne: ['$senderId', userId] },
                              { $gt: ['$sendAt', { $ifNull: ['$$lastOpenedAt', new Date(0)] }] },
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
         {
            $addFields: {
               unreadCount: { $ifNull: [{ $arrayElemAt: ['$unreadMeta.unreadCount', 0] }, 0] },
               updatedAt: '$effectiveUpdatedAt',
            },
         },

         // Cleanup temporary fields
         {
            $project: {
               effectiveUpdatedAt: 0,
               freqMeta: 0,
               userMeta: 0,
               unreadMeta: 0,
            },
         },
      ]);

      return res.map((doc) => conversationWithLastMessageAutoMapper(doc));
   };

   setUserConvoClearedAt = async (
      userId: string,
      convoId: string
   ): Promise<ConvoUserMetadata | null> => {
      const res = await convoUserMetadataModel.findOneAndUpdate(
         {
            convoId: convoId,
            userId: userId,
         },
         {
            $set: {
               clearedAt: new Date(),
            },
         },
         { new: true, upsert: true }
      );
      return res ? convoUserMetaAutomapper(res) : null;
   };
}
