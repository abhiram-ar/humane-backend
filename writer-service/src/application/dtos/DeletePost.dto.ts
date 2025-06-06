import { z } from 'zod';

const deletePostSchema = z.object({
   postId: z.string().nonempty(),
   authorId: z.string().nonempty(),
});
export type DeletePostDTO = z.infer<typeof deletePostSchema>;
