import z from 'zod';

export const googleAuthSchema = z.object({
   email: z.string().email(),
   firstName: z.string(),
   avaratURL: z.string().optional(),
});

export type googleAuthDTO = z.infer<typeof googleAuthSchema>;
