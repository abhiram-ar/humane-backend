import { z } from 'zod';

export const deleteCommentSchema = z.object({
   authorId: z.string().nonempty(),
   postId: z.string().nonempty(),
   commentId: z.string().nonempty(),
});
export type DeleteCommentDTO = z.infer<typeof deleteCommentSchema>;
