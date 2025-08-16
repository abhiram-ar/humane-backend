import { ModerationStatus, Post } from '@domain/entities/Post.entity';
import { IBaseRepository } from './IBaseRepository';

export interface IPostRepository extends IBaseRepository<Post> {
   exists(postId: string): Promise<boolean>;

   setModeration(dto: {
      postId: string;
      moderationStatus: (typeof ModerationStatus)[keyof typeof ModerationStatus];
      moderateionMetadata: any;
   }): Promise<Required<Post> | null>;
}
