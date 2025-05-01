import { z } from 'zod';

export const userLoginSchema = z.object({
   email: z.string().nonempty().email(),
   password: z.string().nonempty(),
});

export type userLoginDTO = z.infer<typeof userLoginSchema>;
