import { Post } from '@domain/entities/Post.entity';
import { IBaseRepository } from './IBaseRepository';

export interface IPostRepository extends IBaseRepository<Post> {
   exists(postId: string): Promise<boolean>;
}
