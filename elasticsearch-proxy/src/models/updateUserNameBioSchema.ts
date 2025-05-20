import { z } from 'zod';

export const updateUserNameAndBioSchema = z.object({
   id: z.string().nonempty(),

   firstName: z.string().nonempty(),
   lastName: z.string().nullish(),
   bio: z.string().nullish(),

   createdAt: z.string(),
});

export type CreateUser = z.infer<typeof updateUserNameAndBioSchema>;
