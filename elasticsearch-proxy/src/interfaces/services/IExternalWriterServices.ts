export interface IExternalWriterService {
   getCommentsMetadataOfAUser(
      commentIds: string[],
      userId?: string
   ): Promise<
      | { id: string; likeCount: number; likedByPostAuthor: boolean; hasLikedByUser?: boolean }[]
      | null
   >;
}
