import { FlattenMaps, HydratedDocument } from 'mongoose';
import { ICommentDocument } from '../Models/commentModel';
import { Comment } from '@domain/entities/Comment.entity';

export const commentAutoMapper = (
   doc: HydratedDocument<ICommentDocument> | FlattenMaps<ICommentDocument>
): Required<Comment> => {
   const dto: Required<Comment> = {
      id: doc.id || doc._id,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      authorId: doc.authorId,
      postId: String(doc.postId),
      content: doc.content,
   };
   return dto;
};
