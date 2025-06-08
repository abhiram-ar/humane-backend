export const PostVisibility = {
   PUBLIC: 'public',
   FRIENDS: 'friends',
} as const;

export const ModerationStatus = {
   PENDING: 'pending',
   OK: 'ok',
   NOT_APPROPRIATE: 'notAppropriate',
} as const;

export class Post {
   public readonly id: string | undefined;
   public readonly createdAt: Date | undefined;
   public updatedAt: Date | undefined;

   public moderationStatus: (typeof ModerationStatus)[keyof typeof ModerationStatus] | undefined;
   public moderationMetadata: any;
   constructor(
      public authorId: string,
      public content: string,
      public visibility: (typeof PostVisibility)[keyof typeof PostVisibility],
      public posterKey?: string
   ) {}
}
