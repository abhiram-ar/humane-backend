import {
   ModerationStatus,
   PostAttachmentStatus,
   PostAttachmentType,
   PostVisibility,
} from 'humane-common';

export type IPostDocument = {
   id: string;
   authorId: string;
   content: string;
   visibility: (typeof PostVisibility)[keyof typeof PostVisibility];
   hashtags: string[];

   attachmentType?: (typeof PostAttachmentType)[keyof typeof PostAttachmentType];
   rawAttachmentKey?: string | null;
   attachmentStatus?: (typeof PostAttachmentStatus)[keyof typeof PostAttachmentStatus];
   processedAttachmentKey?: string | null;

   moderationStatus: (typeof ModerationStatus)[keyof typeof ModerationStatus] | undefined; //TOTO: remove undfiend when mooderation service is implmented
   moderationMetadata?: any;

   createdAt: Date;
   updatedAt: Date;

   // additionally added
   commentCount: Number | null;
};
