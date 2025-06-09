import { CommentEventPayload } from 'humane-common';
import { z } from 'zod';

export const commentSchema = z.object({
   id: z.string(),
   authorId: z.string(),
   postId: z.string(),
   content: z.string(),
   createdAt: z.coerce.date(),
   updatedAt: z.coerce.date(),
});

export type CreateCommentInputDTO = z.infer<typeof commentSchema>;
const assertTypeCompatibility: <T extends CreateCommentInputDTO>() => void = () => {};
assertTypeCompatibility<CommentEventPayload>();
