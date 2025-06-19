export const PostVisibility = {
   PUBLIC: 'public',
   FRIENDS: 'friends',
} as const;

export const ModerationStatus = {
   PENDING: 'pending',
   OK: 'ok',
   NOT_APPROPRIATE: 'notAppropriate',
} as const;

export type IPostDocument = {
   id: string;
   authorId: string;
   content: string;
   posterKey?: string | null;
   visibility: (typeof PostVisibility)[keyof typeof PostVisibility];

   moderationStatus: (typeof ModerationStatus)[keyof typeof ModerationStatus] | undefined; //TOTO: remove undfiend when mooderation service is implmented
   moderationMetadata?: any;

   createdAt: Date;
   updatedAt: Date;

   // additionally added
   commentCount: Number | null;
};
