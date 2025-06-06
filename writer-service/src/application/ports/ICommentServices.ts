import { CreateCommentDTO } from '@application/dtos/CreateComment';
import { DeleteCommentDTO } from '@application/dtos/DeleteComment.dto';
import { Comment } from '@domain/entities/Comment.entity';

export interface ICommentService {
   create(dto: CreateCommentDTO): Promise<Required<Comment>>;
   delete(dto: DeleteCommentDTO): Promise<Required<Comment>>;
}
