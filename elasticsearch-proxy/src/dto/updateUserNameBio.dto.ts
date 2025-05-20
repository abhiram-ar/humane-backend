import { z } from 'zod';

export const updateUserNameAndBioSchema = z.object({
   id: z.string().nonempty(),
   firstName: z.string().nonempty(),
   lastName: z.string().nullable(),
   bio: z.string().nullable(),
});

export type UpdateNameAndBioDTO = z.infer<typeof updateUserNameAndBioSchema>;
