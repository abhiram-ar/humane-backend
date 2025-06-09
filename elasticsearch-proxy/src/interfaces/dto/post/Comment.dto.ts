import { CommentEventPayload } from 'humane-common';
import { z } from 'zod';

export const createCommentSchema = z.object({
   id: z.string(),
   authorId: z.string(),
   postId: z.string(),
   content: z.string(),
   createdAt: z.date(),
   updatedAt: z.date(),
});

export type CreateCommentInputDTO = z.infer<typeof createCommentSchema>;
const assertTypeCompatibility: <T extends CreateCommentInputDTO>() => void = () => {};
assertTypeCompatibility<CommentEventPayload>();
