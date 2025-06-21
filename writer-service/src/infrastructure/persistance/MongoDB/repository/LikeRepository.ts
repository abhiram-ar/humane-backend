import { Like } from '@domain/entities/Likes.entity';
import { ILikesRepository } from '@domain/repository/ILikesRepository';
import likeModel from '../Models/likeModel';
import { likeAutoMapper } from '../mapper/likeAutoMapper';
import { logger } from '@config/logget';
import { HasUserLikedComment } from '@application/Types/HasUserLikedComment.type';

export class LikeRepository implements ILikesRepository {
   constructor() {}

   create(entity: Like): Promise<Required<Like>> {
      throw new Error('Method not implemented.');
   }

   delete(authorId: string, entityId: string): Promise<Required<Like> | null> {
      throw new Error('Method not implemented.');
   }

   bulkInsert = async (likes: Like[]): Promise<Required<Like>[] | null> => {
      const inserts = likes.map((like) => ({ authorId: like.authorId, commentId: like.commentId }));

      try {
         const res = await likeModel.insertMany(inserts, { ordered: false });

         logger.info('full batch inserted');

         return res.map((doc) => likeAutoMapper(doc));
      } catch (err: unknown) {
         if (
            (typeof err === 'object' &&
               err !== null &&
               'name' in err &&
               (err as any).name === 'BulkWriteError') ||
            (err as any).name === 'MongoBulkWriteError'
         ) {
            // Optional: print error reasons
            (err as any).writeErrors.forEach((e: any) => {
               logger.warn(`❌ Failed to insert: ${e.err.errmsg}`);
            });

            const insertedDocs = (err as any).insertedDocs as Array<InstanceType<typeof likeModel>>;
            if (insertedDocs.length > 0) {
               logger.verbose(
                  '✅ Partial batch inserted. Inserted docs:' +
                     JSON.stringify((err as any).insertedDocs, null, 2)
               );
               return insertedDocs.map((doc) => likeAutoMapper(doc));
            } else return [];
         } else {
            logger.error('🚨 Unexpected error while batch inserting likes:', err);
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
         { commentId: 1, _id: 0 } //remove _id we can getId from index
      );
      console.log(res);
      const parsed = res.map((doc) => ({ commentId: String(doc.commentId), hasLikedByUser: true }));

      return parsed;
   };
}
