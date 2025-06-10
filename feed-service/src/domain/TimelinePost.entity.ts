export class TimelinePost {
   public readonly id: string | undefined;
   constructor(
      public readonly userId: string,
      public readonly postId: string,
      public readonly authorId: string,
      public readonly createdAt: Date
   ) {}
}
