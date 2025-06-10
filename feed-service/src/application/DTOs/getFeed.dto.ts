import { z } from 'zod';

export const getFeedInputSchema = z.object({
   userId: z.string(),
   from: z.string().nonempty().nullable(),
   limit: z.number().int().gte(1),
});

export type GetFeedInputDTO = z.infer<typeof getFeedInputSchema>;
