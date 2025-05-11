import z from 'zod';

export const updateAnonAvatarSchema = z.object({
   newAvatarKey: z.string().nonempty(),
});

export type UpdateAnonAvatarnputDTO = z.infer<typeof updateAnonAvatarSchema>;
