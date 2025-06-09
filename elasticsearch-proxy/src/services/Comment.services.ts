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
      await this._commentRepo.deleteById(commentId);
   };
}
