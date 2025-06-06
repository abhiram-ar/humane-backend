import { CreateCommentDTO } from '@application/dtos/CreateComment';
import { DeleteCommentDTO } from '@application/dtos/DeleteComment.dto';
import { EntityNotFound } from '@application/errors/EntityNotFoundError';
import { Comment } from '@domain/entities/Comment.entity';
import { ICommentRepository } from '@domain/repository/ICommentRepository';

export class CommentService {
   constructor(private readonly _commentRepo: ICommentRepository) {}

   create = async (dto: CreateCommentDTO): Promise<Required<Comment>> => {
      const post = new Comment(dto.authorId, dto.postId, dto.content);

      const savedPost = await this._commentRepo.create(post);
      // publish to kafka
      return savedPost;
   };

   delete = async (dto: DeleteCommentDTO): Promise<Required<Comment>> => {
      // note: userId is requesd for this request. Else any authenicated user can delte any post

      const deletedPost = await this._commentRepo.delete(dto.authorId, dto.commentId);
      if (!deletedPost) {
         throw new EntityNotFound(
            `user does not have post my the provided postId ${dto.commentId})`
         );
      } else return deletedPost;
   };
}
