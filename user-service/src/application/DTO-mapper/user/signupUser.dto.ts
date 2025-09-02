import { z } from 'zod';

export const signupUserSchema = z.object({
   firstName: z.string().nonempty().max(20),
   lastName: z.string(),
   email: z.string().email(),
   password: z.string().min(8),
});

export type signupUserDTO = z.infer<typeof signupUserSchema>;
