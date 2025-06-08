import { CreateCommentDTO } from '@application/dtos/CreateComment';
import { DeleteCommentDTO } from '@application/dtos/DeleteComment.dto';
import { EntityNotFound } from '@application/errors/EntityNotFoundError';
import { Comment } from '@domain/entities/Comment.entity';
import { ICommentRepository } from '@domain/repository/ICommentRepository';
import { IPostRepository } from '@domain/repository/IPostRepository';
import { ICommentService } from '@ports/ICommentServices';

export class CommentService implements ICommentService {
   constructor(
      private readonly _commentRepo: ICommentRepository,
      private readonly _postRepo: IPostRepository
   ) {}

   create = async (dto: CreateCommentDTO): Promise<Required<Comment>> => {
      if (!(await this._postRepo.exists(dto.postId))) {
         throw new EntityNotFound('Post does not exists to add comment');
      }

      const comment = new Comment(dto.authorId, dto.postId, dto.content);

      const savedPost = await this._commentRepo.create(comment);
      // publish to kafka
      return savedPost;
   };

   delete = async (dto: DeleteCommentDTO): Promise<Required<Comment>> => {
      // note: userId is requesd for this request. Else any authenicated user can delte any post
      //TODO:  check if the current commnet is of from the post   
      const deletedComment = await this._commentRepo.delete(dto.authorId, dto.commentId);
      if (!deletedComment) {
         throw new EntityNotFound(
            `user does not have post my the provided postId ${dto.commentId})`
         );
      } else return deletedComment;
   };
}
