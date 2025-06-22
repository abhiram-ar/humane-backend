import { commentUnlikeRequestDTO } from '@application/dtos/commentUnlikeRequest.dto';

export interface ILikeServices {
   bulkDelete(dto: commentUnlikeRequestDTO[]): Promise<void>;

   bulkInsert(dto: { commentId: string; authorId: string }[]): Promise<void>;

   hasUserLikedTheseComments(
      userId: string,
      commentIds: string[]
   ): Promise<{ commentId: string; hasLikedByUser: boolean }[]>;
}
