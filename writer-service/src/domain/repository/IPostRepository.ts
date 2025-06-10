import { Post } from '@domain/entities/Post.entity';
import { IBaseRepository } from './IBaseRepository';

export interface IPostRepository extends IBaseRepository<Post> {
   create(post: Post): Promise<Required<Post>>;
   delete(authorId: string, postId: string): Promise<Required<Post> | null>;
   exists(postId: string): Promise<boolean>;
}
