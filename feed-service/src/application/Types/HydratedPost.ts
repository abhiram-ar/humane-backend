import {
   ModerationStatus,
   PostAttachmentStatus,
   PostAttachmentType,
   PostVisibility,
} from 'humane-common';
import { UserBasicDetails } from './UserBasicDetails';

export type HydratedPost = {
   author: UserBasicDetails | undefined;

   id: string;
   authorId: string;
   content: string;
   visibility: (typeof PostVisibility)[keyof typeof PostVisibility];
   hashtags: string[];

   attachmentType?: (typeof PostAttachmentType)[keyof typeof PostAttachmentType];
   rawAttachmentKey?: string | null;
   attachmentStatus?: (typeof PostAttachmentStatus)[keyof typeof PostAttachmentStatus];
   rawAttachmentURL?: string | null;

   moderationStatus: (typeof ModerationStatus)[keyof typeof ModerationStatus] | undefined; //TOTO: remove undfiend when mooderation service is implmented
   moderationMetadata?: any;

   createdAt: Date;
   updatedAt: Date;

   // additionally added
   commentCount: Number | null;
};

export type IPostDocument = {};
