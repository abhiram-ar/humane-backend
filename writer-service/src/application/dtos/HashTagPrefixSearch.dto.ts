import { z } from 'zod';

export const hashtagPrefixSearchSchema = z.object({
   query: z.string().nonempty(),
   limit: z.number().positive(),
});

export type hashtagPrefixSearchInputDTO = z.infer<typeof hashtagPrefixSearchSchema>;
