import { Like } from '@domain/entities/Likes.entity';
import { IBaseRepository } from './BaseRepository';

export interface ILikesRepository extends IBaseRepository<Like> {
   create(entity: Like): Promise<Required<Like>>;
   delete(entity: Like): Promise<Required<Like>>;
}
