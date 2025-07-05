import z from 'zod';

export const getUserHumaneScoreInputSchema = z.object({ userId: z.string().nonempty() });

export type GetUserHumaneScoreInputDTO = z.infer<typeof getUserHumaneScoreInputSchema>;

export type GetUserHumaneScoreOutputDTO = {
   userId: string;
   score: number;
} | null;
