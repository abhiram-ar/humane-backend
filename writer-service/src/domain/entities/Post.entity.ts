export const PostVisibility = {
   PUBLIC: 'public',
   FRIENDS: 'friends',
} as const;

export class Post {
   public readonly id: string | undefined;
   public readonly createdAt: Date | undefined;
   public updatedAt?: Date;
   constructor(
      public authorId: string,
      public content: string,
      public visibility: (typeof PostVisibility)[keyof typeof PostVisibility],
      public posterKey?: string
   ) {}
}
