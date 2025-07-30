import z from 'zod';

export const repliedWithin24HrsInputSchema = z.object({
   messageId: z.string(),

   senderId: z.string(),
   conversationId: z.string(),
   message: z.string().optional(),

   sendAt: z.coerce.date(),
});

export type RepliedWithin24HrsInputDTO = z.infer<typeof repliedWithin24HrsInputSchema>;
