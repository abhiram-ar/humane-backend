import { Post, PostAttachmentStatus } from '@domain/entities/Post.entity';
import { IPostRepository } from '@domain/repository/IPostRepository';
import postModel from '../Models/postModel';
import { postAutoMapper } from '../mapper/postAutoMapper';

export class PostRepository implements IPostRepository {
   create = async (post: Post): Promise<Required<Post>> => {
      const res = await postModel.create({
         authorId: post.authorId,
         content: post.content,
         visibility: post.visibility,
         attachmentType: post.attachmentType,
         rawAttachmentKey: post.rawAttachmentKey,
         processedAttachmentKey: post.rawAttachmentKey,
         attachmentStatus: PostAttachmentStatus.READY, // override - change this when there is a plan to transcode video
         hashtags: post.hashtags,
      });

      return postAutoMapper(res);
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
