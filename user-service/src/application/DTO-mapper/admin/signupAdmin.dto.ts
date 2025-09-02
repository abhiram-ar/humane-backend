import { z } from 'zod';

export const signupAdminSchema = z.object({
   firstName: z.string().nonempty().max(20),
   lastName: z.string().optional(),
   email: z.string().email(),
   password: z.string().min(8),
});

export type signupAdminDTO = z.infer<typeof signupAdminSchema>;
