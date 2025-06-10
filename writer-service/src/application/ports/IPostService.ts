import { CreatePostDTO } from '@application/dtos/CreatePost.dto';
import { DeletePostDTO } from '@application/dtos/DeletePost.dto';
import { Post } from '@domain/entities/Post.entity';

export interface IPostService {
   create(dto: CreatePostDTO): Promise<Required<Post>>;

   delete(dto: DeletePostDTO): Promise<Required<Post>>;
}
