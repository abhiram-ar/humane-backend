import { z } from 'zod';

export const markNotificationAsReadSchema = z.object({
   userId: z.string().nonempty(),
   fromId: z.string().nonempty(),
});

export type MarkNotificationAsReadInputDTO = z.infer<typeof markNotificationAsReadSchema>;
