import z from 'zod';

export const setRewardConfigInputSchema = z.object({
   HELPFUL_COMMENT: z.coerce.number().positive(),
   CHAT_CHECKIN: z.coerce.number().positive(),
});

export type SetRewardConfigInputDTO = z.infer<typeof setRewardConfigInputSchema>;
