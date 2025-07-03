import { FlattenMaps, HydratedDocument, isValidObjectId } from 'mongoose';
import { ICommentDocument } from '../Models/commentModel';
import { Comment } from '@domain/entities/Comment.entity';
import { IPostDocumnet } from '../Models/postModel';

export const commentAutoMapper = (
   doc: HydratedDocument<ICommentDocument> | FlattenMaps<ICommentDocument>
): Required<Comment> => {
   let postId: string | any;
   if (!doc.postId) {
      postId = '';
   } else if (typeof doc.postId === 'object') {
      postId = String(doc.postId);
   } else if (typeof doc.postId === 'string' || isValidObjectId(postId)) {
      const typedPostId = doc.postId as HydratedDocument<IPostDocumnet>;
      postId = typedPostId.id || String(typedPostId._id);
   }

   const dto: Required<Comment> = {
      id: doc.id || doc._id,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      authorId: doc.authorId,
      content: doc.content,
      likeCount: doc.likeCount,
      likedByPostAuthor: doc.likedByPostAuthor,
      postId,
   };
   return dto;
};
