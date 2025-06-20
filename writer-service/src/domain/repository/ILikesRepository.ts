import { Like } from '@domain/entities/Likes.entity';
import { IBaseRepository } from './IBaseRepository';

export interface ILikesRepository extends IBaseRepository<Like> {
   bulkInsert(likes: Like[]): Promise<Required<Like>[] | null>;
}
