import z from 'zod';

export const repliedWithinIntervalUserMsgSchema = z.object({
   messageId: z.string(),

   senderId: z.string(),
   conversationId: z.string(),
   message: z.string().optional(),

   sendAt: z.coerce.date(),
});

export type RepliedWithinIntervalUserMsgIngputDTO = z.infer<typeof repliedWithinIntervalUserMsgSchema>;
