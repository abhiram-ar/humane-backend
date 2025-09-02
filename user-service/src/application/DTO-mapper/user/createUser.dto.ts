import { z } from 'zod';

export const createUserSchema = z.object({
   firstName: z.string().nonempty().max(20),
   lastName: z.string().optional(),
   email: z.string().email(),
   passwordHash: z.string().min(8),
});

export type createUserDTO = z.infer<typeof createUserSchema>;
