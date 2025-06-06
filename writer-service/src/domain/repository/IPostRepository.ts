import { Post } from '@domain/entities/Post.entity';
import { IBaseRepository } from './BaseRepository';

export interface IPostRepository extends IBaseRepository<Post> {
   create(entity: Post): Promise<Required<Post>>;
   delete(entity: Post): Promise<Required<Post>>;
}
