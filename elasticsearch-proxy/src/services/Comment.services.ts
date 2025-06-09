import { logger } from '@config/logger';
import { CreateCommentInputDTO } from 'interfaces/dto/post/Comment.dto';
import { ICommenetRepository } from 'interfaces/repository/ICommentRepository';

export class CommentService {
   constructor(private readonly _commentRepo: ICommenetRepository) {}

   upsert = async (dto: CreateCommentInputDTO): Promise<void> => {
      // if events are retried
      const exisingPost = await this._commentRepo.getUpdatedAt(dto.id);
      if (!exisingPost) {
         await this._commentRepo.create(dto);
         return;
      }
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
}
