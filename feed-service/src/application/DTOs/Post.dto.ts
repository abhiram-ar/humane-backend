import {
   ModerationStatus,
   PostAttachmentStatus,
   PostEventPayload,
   PostVisibility,
} from 'humane-common';
import { z } from 'zod';

export const postSchema = z.object({
   id: z.string(),
   authorId: z.string(),
   content: z.string().nonempty().max(256),
   visibility: z.enum([PostVisibility.FRIENDS, PostVisibility.PUBLIC]),
   hashtags: z.array(z.string()),

   attachmentType: z.string().nullish().optional(),
   attachmentStatus: z
      .enum([
         PostAttachmentStatus.READY,
         PostAttachmentStatus.PROCESSING,
         PostAttachmentStatus.ERROR,
      ])
      .optional(),
   rawAttachmentKey: z.string().nullish().optional(),
   processedAttachmentKey: z.string().nullish().optional(),

   moderationStatus: z.enum([
      ModerationStatus.PENDING,
      ModerationStatus.OK,
      ModerationStatus.NOT_APPROPRIATE,
      ModerationStatus.FAILED,
   ]),
   moderationMetadata: z.any().nullish().optional(),

   createdAt: z.coerce.date(),
   updatedAt: z.coerce.date(),
});

export type PostInputDTO = z.infer<typeof postSchema>;
const assertTypeCompatibility: <T extends PostInputDTO>() => void = () => {};
assertTypeCompatibility<PostEventPayload>();
