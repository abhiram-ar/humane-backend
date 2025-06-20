import { Like } from '@domain/entities/Likes.entity';

export interface ILikeServices {
   bulkInsert(dto: { commentId: string; authorId: string }[]): Promise<Required<Like>[] | null>;
}
