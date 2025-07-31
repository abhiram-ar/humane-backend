import { UserRewardedEventPayload } from 'humane-common';
import { z } from 'zod';

export const userRewardedSchema = z.object({
   userId: z.string().nonempty(),
   amount: z.number().positive(),
});

export type UserRewadedInputDTO = z.infer<typeof userRewardedSchema>;
const assertTypeCompatibility: <T extends UserRewadedInputDTO>() => void = () => {};
assertTypeCompatibility<UserRewardedEventPayload>();
