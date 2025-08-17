import { ModerationStatus, PostAttachmentStatus, PostVisibility } from 'humane-common';

export type IPostDocument = {
   id: string;
   authorId: string;
   content: string;
   visibility: (typeof PostVisibility)[keyof typeof PostVisibility];
   hashtags: string[];

   attachmentType?: string | null;
   rawAttachmentKey?: string | null;
   attachmentStatus?: (typeof PostAttachmentStatus)[keyof typeof PostAttachmentStatus];
   processedAttachmentKey?: string | null;

   moderationStatus: (typeof ModerationStatus)[keyof typeof ModerationStatus];
   moderationMetadata?: any;

   createdAt: Date;
   updatedAt: Date;

   // additionally added
   commentCount: Number | null;
};
