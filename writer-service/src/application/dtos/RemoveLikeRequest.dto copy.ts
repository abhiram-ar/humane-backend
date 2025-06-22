import { z } from 'zod';

export const removeCommentLikeRequestSchema = z.object({
   authorId: z.string().nonempty(),
   commentId: z.string().nonempty(),
});

export type RemoveCommentLikeRequestDTO = z.infer<typeof removeCommentLikeRequestSchema>;
