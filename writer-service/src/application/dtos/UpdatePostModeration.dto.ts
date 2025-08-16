import { PostModeratedPayload } from 'humane-common';
import { z } from 'zod';

export const updatePostModerationInputSchema = z.object({
   postId: z.string(),
   result: z.discriminatedUnion('success', [
      z.object({
         success: z.literal(false),
      }),
      z.object({
         success: z.literal(true),
         flagged: z.boolean(),
         moderdationData: z.any().optional(),
      }),
   ]),
});

export type UpdatePostModerationInputDTO = z.infer<typeof updatePostModerationInputSchema>;

const assertTypeCompatibility: <T extends PostModeratedPayload>() => void = () => {};
assertTypeCompatibility<UpdatePostModerationInputDTO>();
