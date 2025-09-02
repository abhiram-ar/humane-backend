import z from 'zod';

export const recoverPasswordSchema = z.object({
   recoveryToken: z.string().nonempty(),
   newPassword: z.string().nonempty().min(8, 'Atlest 8 characters'),
});

export type recoverPasswordDTO = z.infer<typeof recoverPasswordSchema>;
