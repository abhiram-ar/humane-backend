import { z } from 'zod';

export const getTimelineInputSchema = z.object({
   userId: z.string(),
   from: z.string().nonempty().nullable(),
   limit: z.number().int().gte(1),
});

export type GetTimelineInputDTO = z.infer<typeof getTimelineInputSchema>;
