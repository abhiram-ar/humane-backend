import z from 'zod';

export const getUserScoreInputSchema = z.object({ userId: z.string().nonempty() });

export type GetUserScoreInputDTO = z.infer<typeof getUserScoreInputSchema>;
