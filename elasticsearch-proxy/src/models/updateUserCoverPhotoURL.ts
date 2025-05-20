import { z } from 'zod';

export const createUserSchema = z.object({
   id: z.string().nonempty(),

   coverPhotoKey: z.string().nullish(),

   createdAt: z.string(),
});

export type CreateUser = z.infer<typeof createUserSchema>;
