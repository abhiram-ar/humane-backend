import { Like } from '@domain/entities/Likes.entity';
import { ILikeDocument } from '../Models/likeModel';
import { HydratedDocument } from 'mongoose';

export const likeAutoMapper = (doc: HydratedDocument<ILikeDocument>): Required<Like> => {
   const dto: Required<Like> = {
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      authorId: doc.authorId,
      commentId: doc.commentId.toString(),
   };
   return dto;
};
