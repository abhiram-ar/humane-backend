import { Like } from '@domain/entities/Likes.entity';
import { IBaseRepository } from './IBaseRepository';
import { HasUserLikedComment } from '@application/Types/HasUserLikedComment.type';

export interface ILikesRepository extends IBaseRepository<Like> {
   bulkInsert(likes: Like[]): Promise<Required<Like>[] | null>;
   hasUserLikedTheseComments(userId: string, commentIds: string[]): Promise<HasUserLikedComment[]>;
}
