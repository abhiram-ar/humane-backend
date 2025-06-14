import { CreateCommentInputDTO } from 'interfaces/dto/post/Comment.dto';

export interface ICommentService {
   upsert(dto: CreateCommentInputDTO): Promise<void>;
   delete(commentId: string): Promise<void>;
   deleteAllPostComments(postId: string): Promise<void>;
}
