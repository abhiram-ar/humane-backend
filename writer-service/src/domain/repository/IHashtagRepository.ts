import { HashTag } from '@domain/entities/hashtag.entity';
import { IBaseRepository } from './IBaseRepository';

export interface IHashtagRepository extends IBaseRepository<HashTag> {
   prefixSearch(query: string, limit: number): Promise<HashTag[]>;
}
