import { hashtagPrefixSearchInputDTO } from '@application/dtos/HashTagPrefixSearch.dto';
import { HashTag } from '@domain/entities/hashtag.entity';
import { IHashtagRepository } from '@domain/repository/IHashtagRepository';
import { IHashtagServices } from '@ports/IHashtagServices';

export class HashtagServices implements IHashtagServices {
   constructor(private readonly _hashtagRepo: IHashtagRepository) {}

   prefixQuery = async (dto: hashtagPrefixSearchInputDTO): Promise<HashTag[]> => {
      // sanitize prefix to avoid regex injection
      const safePrefix = dto.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return this._hashtagRepo.prefixSearch(safePrefix, dto.limit);
   };
}
