import { z } from 'zod';

export const adminLoginSchema = z.object({
   email: z.string().nonempty().email(),
   password: z.string().nonempty(),
});

export type adminLoginDTO = z.infer<typeof adminLoginSchema>;
