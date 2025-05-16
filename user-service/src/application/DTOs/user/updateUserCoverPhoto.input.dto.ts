import z from 'zod';

export const updateUserCoverPhotoSchema = z.object({
   newCoverPhotoKey: z.string(),
});

export type UpdateUserCoverPhotoInputDTO = z.infer<typeof updateUserCoverPhotoSchema>;
