import z from 'zod';

export const updateUserAvatarSchema = z.object({
   newAvatarKey: z.string(),
});

export type UpdateUserAvatarInputDTO = z.infer<typeof updateUserAvatarSchema>;
