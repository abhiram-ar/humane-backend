import z from 'zod';

export const forgotPasswordSchema = z.object({
   email: z.string().nonempty().email('Invalid email'),
});

export type forgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
