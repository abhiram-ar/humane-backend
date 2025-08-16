import { ModerationStatus, PostEventPayload } from 'humane-common';
import { z } from 'zod';

export const PostVisibility = {
   PUBLIC: 'public',
   FRIENDS: 'friends',
} as const;

export const postSchema = z.object({
   id: z.string(),
   authorId: z.string(),
   content: z.string().nonempty().max(256),
   posterKey: z.string().nullish().optional(),
   visibility: z.enum([PostVisibility.FRIENDS, PostVisibility.PUBLIC]),

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
