import { z } from 'zod';

export const verifyUserSchema = z.object({
   activationCode: z.number(),
   activationToken: z.string().nonempty(),
});

export type verifyUserDTO = z.infer<typeof verifyUserSchema>;
