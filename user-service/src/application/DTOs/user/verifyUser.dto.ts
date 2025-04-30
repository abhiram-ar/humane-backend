import { z } from 'zod';
import { createUserSchema } from './createUser.dto';

export const verifyUserSchema = z.object({
   activationCode: z.string().nonempty(),
   activationToken: z.string().nonempty(),
});
export type verifyUserDTO = z.infer<typeof verifyUserSchema>;

export const verifedUserTokenSchema = createUserSchema.extend({
   otpHash: z.string().nonempty(),
});
export type verifedUserToken = z.infer<typeof verifedUserTokenSchema>;
