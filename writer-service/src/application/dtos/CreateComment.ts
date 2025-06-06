import { z } from 'zod';

const createCommentSchema = z.object({
   authorId: z.string().nonempty(),
   postId: z.string().nonempty(),
   content: z.string().trim().nonempty().max(256),
});
export type CreateCommentDTO = z.infer<typeof createCommentSchema>;
