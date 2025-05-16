import z from 'zod';

export const updateUserProfileSchema = z.object({
   firstName: z.string().nonempty('required').max(20, 'max 20 char'),
   lastName: z.string().max(20, 'max 20 chars'),
   bio: z.string().max(256, 'max 256 char'),
});

export type UpdateUserProfileInputDTO = z.infer<typeof updateUserProfileSchema>;
