import { UserPasswordRecoveryEventPaylaod } from 'humane-common';
import z from 'zod';

export const sendPasswordRecoveryMailInputSchema = z.object({
   email: z.string().nonempty().email(),
   data: z.object({
      token: z.string().nonempty(),
   }),
});

export type SendPasswordRecoveryMailInputDTO = z.infer<typeof sendPasswordRecoveryMailInputSchema>;

const assertTypeCompatibility: <T extends UserPasswordRecoveryEventPaylaod>() => void = () => {};
assertTypeCompatibility<SendPasswordRecoveryMailInputDTO>();
