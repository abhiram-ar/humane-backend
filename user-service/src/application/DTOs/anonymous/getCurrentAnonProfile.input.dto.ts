import z from 'zod';

export const getCurrentAnonProfileSchema = z.object({
   anonId: z.string().nonempty(),
});

export type GetCurrentAnonProfileInputDTO = z.infer<typeof getCurrentAnonProfileSchema>;
