export const PostVisibility = {
   PUBLIC: 'public',
   FRIENDS: 'friends',
} as const;

export const ModerationStatus = {
   PENDING: 'pending',
   OK: 'ok',
   NOT_APPROPRIATE: 'notAppropriate',
} as const;
export const PostAttachmentStatus = {
   READY: 'ready',
   PROCESSING: 'processing',
   ERROR: 'error',
} as const;

export class Post {
   public readonly id?: string;
   public readonly createdAt?: Date;
   public updatedAt?: Date;

   public moderationStatus?: (typeof ModerationStatus)[keyof typeof ModerationStatus];
   public moderationMetadata: any | null;

   public attachmentStatus?: (typeof PostAttachmentStatus)[keyof typeof PostAttachmentStatus];
   public processedAttachmentKey?: string | null;
   constructor(
      public authorId: string,
      public content: string,
      public visibility: (typeof PostVisibility)[keyof typeof PostVisibility],
      public hashtags: string[],

      public attachmentType?: string, // mime type
      public rawAttachmentKey?: string | null
   ) {}
}
