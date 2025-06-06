import { FlattenMaps, HydratedDocument } from 'mongoose';
import { IPostDocumnet } from '../Models/postModel';
import { Post } from '@domain/entities/Post.entity';

export const postAutoMapper = (
   doc: HydratedDocument<IPostDocumnet> | FlattenMaps<IPostDocumnet>
): Required<Post> => {
   const savedPost: Required<Post> = {
      id: doc.id || doc._id, // FlattedMaps will not have doc.id
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      authorId: doc.authorId,
      content: doc.content,
      visibility: doc.visibility,
      posterKey: doc.posterKey,
   };

   return savedPost;
};
