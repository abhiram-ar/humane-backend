import { logger } from '@config/logger';
import { PostInputDTO } from 'interfaces/dto/post/Post.dto';
import { IPostRepository } from 'interfaces/repository/IPostRepository';

export class PostService {
   constructor(private readonly _postRepo: IPostRepository) {}

   upsert = async (dto: PostInputDTO): Promise<void> => {
      // if events are retried
      const exisingPost = await this._postRepo.getUpdatedAt(dto.id);
      if (!exisingPost) {
         await this._postRepo.create(dto);
         return;
      }

      if (new Date(dto.updatedAt) > new Date(exisingPost.updatedAt)) {
         await this._postRepo.replace(dto.id, dto);
         return;
      } else logger.warn('Skipping post creation since incommiing document is old');
   };

   delete = async (postId: string): Promise<void> => {
      await this._postRepo.deleteById(postId);
   };
}
