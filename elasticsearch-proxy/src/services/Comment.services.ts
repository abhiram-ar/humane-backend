import { logger } from '@config/logger';
import { CreateCommentInputDTO } from 'interfaces/dto/post/Comment.dto';
import { ICommenetRepository } from 'interfaces/repository/ICommentRepository';
import { ICommentService } from 'interfaces/services/IComment.services';

export class CommentService implements ICommentService {
   constructor(private readonly _commentRepo: ICommenetRepository) {}

   upsert = async (dto: CreateCommentInputDTO): Promise<void> => {
      // if events are retried
      const exisingPost = await this._commentRepo.getUpdatedAt(dto.id);
      if (!exisingPost) {
         await this._commentRepo.create(dto);
         return;
      }
      logger.warn('Comment already exist, skipping upsert');
   };

   delete = async (commentId: string): Promise<void> => {
      const res = await this._commentRepo.deleteById(commentId);
      if (!res.found) {
         logger.warn(`Cannot find comment ${commentId} to delete`);
      }
      if (res.found && !res.deleted) {
         logger.error(`Unable to delete comment ${commentId}`);
      }
   };

   deleteAllPostComments = async (postId: string): Promise<void> => {
      const { deletedCount } = await this._commentRepo.deleteAllPostComments(postId);
      logger.info(`deleted ${deletedCount} related to post(${postId})`);
   };
}
