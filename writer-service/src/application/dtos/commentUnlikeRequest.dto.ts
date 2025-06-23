import { z } from 'zod';

export const commentUnlikeRequestSchema = z.object({
   authorId: z.string().nonempty(),
   commentId: z.string().nonempty(),
});

export type commentUnlikeRequestDTO = z.infer<typeof commentUnlikeRequestSchema>;
