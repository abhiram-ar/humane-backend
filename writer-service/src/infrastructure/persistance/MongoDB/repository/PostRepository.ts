import { ModerationStatus, Post, PostAttachmentStatus } from '@domain/entities/Post.entity';
import { IPostRepository } from '@domain/repository/IPostRepository';
import postModel from '../Models/postModel';
import { postAutoMapper } from '../mapper/postAutoMapper';
import mongoose from 'mongoose';
import hashtagModel from '../Models/hashtagModel';

export class PostRepository implements IPostRepository {
   getPostCount = async (from?: Date): Promise<number> => {
      return await postModel.countDocuments(from ? { createdAt: { $gte: from } } : {});
   };
   setModeration = async (dto: {
      postId: string;
      moderationStatus: (typeof ModerationStatus)[keyof typeof ModerationStatus];
      moderateionMetadata: any;
   }): Promise<Required<Post> | null> => {
      const res = await postModel.findByIdAndUpdate(
         dto.postId,
         {
            $set: {
               moderationStatus: dto.moderationStatus,
               moderationMetadata: dto.moderateionMetadata,
            },
         },
         { new: true }
      );

      return res ? postAutoMapper(res) : null;
   };
   create = async (post: Post): Promise<Required<Post>> => {
      const session = await mongoose.startSession();

      try {
         session.startTransaction();
         const res = await postModel.create(
            [
               {
                  authorId: post.authorId,
                  content: post.content,
                  visibility: post.visibility,
                  attachmentType: post.attachmentType,
                  rawAttachmentKey: post.rawAttachmentKey,
                  processedAttachmentKey: post.rawAttachmentKey,
                  attachmentStatus: PostAttachmentStatus.READY, // override - change this when there is a plan to transcode video
                  hashtags: post.hashtags,
               },
            ],
            { session: session }
         );

         if (post.hashtags.length > 0) {
            const operations = post.hashtags.map((tag) => ({
               updateOne: {
                  filter: { name: tag },
                  update: {
                     $inc: { count: 1 },
                  },
                  upsert: true,
               },
            }));

            await hashtagModel.bulkWrite(operations, { session });
         }
         await session.commitTransaction();
         await session.endSession();
         return postAutoMapper(res[0]);
      } catch (error) {
         await session.abortTransaction();
         await session.endSession();
         throw error;
      }
   };
   delete = async (authorId: string, postId: string): Promise<Required<Post> | null> => {
      const res = await postModel.findOneAndDelete({ authorId, _id: postId }).lean();
      if (!res) return null;
      return postAutoMapper(res);
   };
   exists = async (postId: string): Promise<boolean> => {
      const res = await postModel.findById(postId, { _id: 1 }).lean();
      return res ? true : false;
   };
}
