import { z } from 'zod';

export const getCommentsInputScheam = z.object({
   postId: z.string().nonempty(),
   limit: z.number().positive(),
   from: z.string().nonempty().nullable(),
});

export type GetCommentsInputDTO = z.infer<typeof getCommentsInputScheam>;
