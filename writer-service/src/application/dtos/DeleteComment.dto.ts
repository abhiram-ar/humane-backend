import { z } from 'zod';

const deleteCommentSchema = z.object({
   authorId: z.string().nonempty(),
   commentId: z.string().nonempty(),
});
export type DeleteCommentDTO = z.infer<typeof deleteCommentSchema>;
