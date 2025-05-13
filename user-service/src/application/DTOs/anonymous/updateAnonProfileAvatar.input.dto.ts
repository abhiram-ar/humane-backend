import z from 'zod';

export const updateAnonAvatarSchema = z.object({
   newAvatarKey: z.string(),
});

export type UpdateAnonAvatarInputDTO = z.infer<typeof updateAnonAvatarSchema>;
