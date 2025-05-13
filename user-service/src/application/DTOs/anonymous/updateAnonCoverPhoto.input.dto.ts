import z from 'zod';

export const updateAnonCoverPhotoSchema = z.object({
   newCoverPhotoKey: z.string(),
});

export type UpdateAnonCoverPhotoInputDTO = z.infer<typeof updateAnonCoverPhotoSchema>;
