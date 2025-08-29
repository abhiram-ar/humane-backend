import { Like } from '@domain/entities/Likes.entity';
import { ILikesRepository } from '@domain/repository/ILikesRepository';
import likeModel from '../Models/likeModel';
import { likeAutoMapper } from '../mapper/likeAutoMapper';
import { logger } from '@config/logget';
import { HasUserLikedComment } from '@application/Types/HasUserLikedComment.type';
import mongoose, { isValidObjectId } from 'mongoose';
import commentModel from '../Models/commentModel';
import { BulkUpdateCommentLikeCountInputDTO } from '@application/dtos/BulkUpdateCommentLikeCount.dto';

export class LikeRepository implements ILikesRepository {
   constructor() {}

   create(entity: Like): Promise<Required<Like>> {
      throw new Error('Method not implemented.');
   }

   delete(authorId: string, entityId: string): Promise<Required<Like> | null> {
      throw new Error('Method not implemented.');
   }
   bulkDelete = async (likes: Like[]): Promise<Required<Like>[]> => {
      const sanitizedLikes = likes.filter((like) => {
         if (isValidObjectId(like.commentId)) return true;
         logger.warn(`Invalid objectId (comment: ${like.commentId}), skipping like deletion`);
         return false;
      });

      if (sanitizedLikes.length === 0) return []; // ⚠️ if empty filter execute all the data in the collection will be cleared

      const docsFilter = sanitizedLikes.map((like) => ({
         authorId: like.authorId,
         commentId: like.commentId,
      }));

      const session = await mongoose.startSession();
      try {
         session.startTransaction();

         const likesFound = await likeModel.find({ $or: docsFilter }, {}, { session });

         const deleteFilter = likesFound.map((like) => ({
            authorId: like.authorId,
            commentId: like.commentId,
         }));
         if (deleteFilter.length === 0) {
            await session.abortTransaction();
            await session.endSession();
            return [];
         }

         await likeModel.deleteMany({ $or: deleteFilter }, { ordered: false, session });

         const comnetLikeCountdiffMap = new Map<string, number>();
         likesFound.forEach((like) => {
            const prevCountDiff = comnetLikeCountdiffMap.get(String(like.commentId)) ?? 0;
            comnetLikeCountdiffMap.set(String(like.commentId), prevCountDiff - 1);
         });

         const updateCommnetCountDTO: BulkUpdateCommentLikeCountInputDTO = [];
         for (let [commentId, likeCountDiff] of comnetLikeCountdiffMap.entries()) {
            updateCommnetCountDTO.push({ commentId, likeCountDiff });
         }

         const bulkCommentCountDiffUpdates: Parameters<typeof commentModel.bulkWrite>[0] =
            updateCommnetCountDTO.map((op) => ({
               updateOne: {
                  filter: { _id: op.commentId },
                  update: { $inc: { likeCount: op.likeCountDiff } },
               },
            }));
         const bulkwriteRes = await commentModel.bulkWrite(bulkCommentCountDiffUpdates, {
            ordered: false,
            session,
         });
         logger.debug(`updated ${bulkwriteRes.modifiedCount} comment document(s) like count`);

         await session.commitTransaction();
         await session.endSession();
         return likesFound.map(likeAutoMapper);
      } catch (error) {
         logger.error('errro while commnet like bulk delete transaction', { error });
         session.abortTransaction();
         await session.endSession();
         throw error;
      }
   };

   bulkInsert = async (likes: Like[]): Promise<Required<Like>[] | null> => {
      const inserts = likes
         .filter((like) => {
            if (isValidObjectId(like.commentId)) return true;
            logger.warn(
               `Invalid objectId (comment: ${like.commentId}), skipping this commnet like entry`
            );
            return false;
         })
         .map((like) => ({ authorId: like.authorId, commentId: like.commentId }));

      if (inserts.length === 0) return [];

      try {
         const res = await likeModel.insertMany(inserts, { ordered: false });

         return res.map((doc) => likeAutoMapper(doc));
      } catch (err: unknown) {
         if (
            (err as any)?.name === 'BulkWriteError' ||
            (err as any)?.name === 'MongoBulkWriteError'
         ) {
            // Optional: print error reasons
            (err as any).writeErrors.forEach((e: any) => {
               logger.warn(`❌ Failed to insert: ${e.err.errmsg}`);
            });

            const insertedDocs = (err as any).insertedDocs as Array<InstanceType<typeof likeModel>>;
            if (insertedDocs.length > 0) {
               logger.verbose('✅ Partial batch inserted. Inserted docs:', { error: err });
               return insertedDocs.map((doc) => likeAutoMapper(doc));
            } else return [];
         } else {
            logger.error('🚨 Unexpected error while batch inserting likes:', { error: err });
            return null;
         }
      }
   };

   hasUserLikedTheseComments = async (
      userId: string,
      commentIds: string[]
   ): Promise<HasUserLikedComment[]> => {
      const res = await likeModel.find(
         { authorId: userId, commentId: { $in: commentIds } },
         { commentId: 1, _id: 0 } //remove _id we can commentId from index
      );
      const parsed = res.map((doc) => ({ commentId: String(doc.commentId), hasLikedByUser: true }));

      return parsed;
   };
}
