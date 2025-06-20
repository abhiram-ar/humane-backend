import { BulkCommnetLikeInsertInputDTO } from '@application/dtos/BulkCommentLikeInsertInput.dto';
import { Like } from '@domain/entities/Likes.entity';
import { ILikesRepository } from '@domain/repository/ILikesRepository';
import { ILikeServices } from '@ports/ILikeServices';

export class LikeServices implements ILikeServices {
   constructor(private readonly _likeRepo: ILikesRepository) {}

   bulkInsert = async (dto: BulkCommnetLikeInsertInputDTO): Promise<Required<Like>[] | null> => {
      const domainLikes = dto.map((like) => new Like(like.authorId, like.commentId));

      return await this._likeRepo.bulkInsert(domainLikes);
   };
}
