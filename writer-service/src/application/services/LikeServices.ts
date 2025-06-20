import { Like } from '@domain/entities/Likes.entity';
import { ILikesRepository } from '@domain/repository/ILikesRepository';

export class LikeServices {
   constructor(private readonly _likeRepo: ILikesRepository) {}

   bulkInsert = async (
      dto: { commentId: string; authorId: string }[]
   ): Promise<Required<Like>[] | null> => {
      const domainLikes = dto.map((like) => new Like(like.authorId, like.commentId));

      return await this._likeRepo.bulkInsert(domainLikes);
   };
}
