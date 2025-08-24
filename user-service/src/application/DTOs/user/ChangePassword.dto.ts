import { z } from 'zod';

export const changePasswordInputSchema = z.object({
   userId: z.string().nonempty(),
   password: z.string().nonempty().min(8),
   newPassword: z.string().nonempty().min(8),
});

export type ChangePasswordInputDTO = z.infer<typeof changePasswordInputSchema>;
