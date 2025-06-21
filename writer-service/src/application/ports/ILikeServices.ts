export interface ILikeServices {
   bulkInsert(dto: { commentId: string; authorId: string }[]): Promise<void>;

   hasUserLikedTheseComments(
      userId: string,
      commentIds: string[]
   ): Promise<{ commentId: string; hasLikedByUser: boolean }[]>;
}
