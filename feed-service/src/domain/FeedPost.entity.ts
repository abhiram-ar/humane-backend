export class FeedPostEntity {
   public readonly id?: string;
   constructor(
      public readonly userId: string,
      public readonly postId: string,
      public readonly authorId: string,
      public readonly createdAt: Date
   ) {}
}
