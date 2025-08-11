import z from 'zod';

export const createOneToOneCallSchema = z.object({
   from: z.string(),
   to: z.string(),
});

export type CreateOneToOneCallInputDTO = z.infer<typeof createOneToOneCallSchema>;
