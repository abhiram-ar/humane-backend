import z from 'zod';
import { UserSignupEventPayload } from 'humane-common';

export const sendUserVerificationMailInputSchema = z.object({
   email: z.string().nonempty().email(),
   data: z.object({
      otp: z.string(),
      firstName: z.string(),
   }),
});

export type SendUserVerificationMailDTO = z.infer<typeof sendUserVerificationMailInputSchema>;

const assertTypeCompatibility: <T extends UserSignupEventPayload>() => void = () => {};
assertTypeCompatibility<SendUserVerificationMailDTO>();
