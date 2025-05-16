import z from 'zod';

export const getCurrentAnonProfileSchema = z.object({
   userId: z.string().nonempty(),
});

export type GetCurrentAnonProfileInputDTO = z.infer<typeof getCurrentAnonProfileSchema>;
