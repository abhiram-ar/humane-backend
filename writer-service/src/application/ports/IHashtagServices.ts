import { hashtagPrefixSearchInputDTO } from '@application/dtos/HashTagPrefixSearch.dto';
import { HashTag } from '@domain/entities/hashtag.entity';

export interface IHashtagServices {
   prefixQuery(dto: hashtagPrefixSearchInputDTO): Promise<HashTag[]>;
}
