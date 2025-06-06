import { z } from 'zod';

const createCommentSchema = z.object({
   authorId: z.string().nonempty(),
   postId: z.string().nonempty(),
   content: z.string().nonempty(),
});
export type CreateCommentDTO = z.infer<typeof createCommentSchema>;
