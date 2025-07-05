import { UserRewardedEventPayload } from 'humane-common';
import { z } from 'zod';

export const rewardSchema = z.object({
   userId: z.string().nonempty(),
   amount: z.number(),
});

export type RewardDTO = z.infer<typeof rewardSchema>;

const assertTypeCompatability: <T extends UserRewardedEventPayload>() => void = () => {};
assertTypeCompatability<RewardDTO>();
