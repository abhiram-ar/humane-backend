import { z } from 'zod';

export const getPostsByHashtagSchema = z.object({
   hashtag: z.string().nonempty(),
   from: z.string().nullable().optional(),
   limit: z.number().positive(),
});

export type GetPostsByHashtagInputDTO = z.infer<typeof getPostsByHashtagSchema>;
