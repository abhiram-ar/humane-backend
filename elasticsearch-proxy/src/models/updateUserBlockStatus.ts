import { z } from 'zod';

export const updateUserBlockStatus = z.object({
   id: z.string().nonempty(),
   createdAt: z.string(),
   isBlocked: z.boolean(),
});

export type CreateUser = z.infer<typeof updateUserBlockStatus>;
