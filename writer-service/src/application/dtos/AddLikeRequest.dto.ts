import { z } from 'zod';

export const addCommentLikeRequestSchema = z.object({
   authorId: z.string().nonempty(),
   commentId: z.string().nonempty(),
});

export type AddCommentLikeRequestDTO = z.infer<typeof addCommentLikeRequestSchema>;
