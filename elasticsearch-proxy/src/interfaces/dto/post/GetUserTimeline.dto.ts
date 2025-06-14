import { z } from 'zod';

export const getUserTimelineSchema = z.object({
   targetUserId: z.string().nonempty(),
   limit: z.number().gt(0),
   from: z.string().nonempty().nullable().optional(),
});

export type GetUserTimelineInputDTO = z.infer<typeof getUserTimelineSchema>;
