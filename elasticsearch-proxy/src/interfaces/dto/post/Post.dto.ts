import { PostEventPayload } from 'humane-common';
import { z } from 'zod';

export const PostVisibility = {
   PUBLIC: 'public',
   FRIENDS: 'friends',
} as const;

export const ModerationStatus = {
   PENDING: 'pending',
   OK: 'ok',
   NOT_APPROPRIATE: 'notAppropriate',
} as const;

export const postSchema = z.object({
   id: z.string(),
   authorId: z.string(),
   content: z.string().nonempty().max(256),
   posterKey: z.string().nullable(),
   visibility: z.enum([PostVisibility.FRIENDS, PostVisibility.PUBLIC]),

   moderationStatus: z.enum([
      ModerationStatus.PENDING,
      ModerationStatus.OK,
      ModerationStatus.NOT_APPROPRIATE,
   ]),
   moderationMetadata: z.any(),

   createdAt: z.date(),
   updatedAt: z.date(),
});

export type PostInputDTO = z.infer<typeof postSchema>;
const assertTypeCompatibility: <T extends PostInputDTO>() => void = () => {};
assertTypeCompatibility<PostEventPayload>();
