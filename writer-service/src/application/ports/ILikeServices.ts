export interface ILikeServices {
   bulkInsert(dto: { commentId: string; authorId: string }[]): Promise<void>;
}
