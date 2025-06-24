import { ModerationStatus, PostVisibility } from 'humane-common';

export type Post = {
   id: string;
   createdAt: Date;
   updatedAt: Date;
   authorId: string;
   content: string;
   visibility: (typeof PostVisibility)[keyof typeof PostVisibility];
   moderationStatus: (typeof ModerationStatus)[keyof typeof ModerationStatus];
   moderationMetadata?: any;
   posterURL: string | null;
};
