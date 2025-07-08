import { conversationTypes } from '@domain/Conversation';
import z from 'zod';

export const createConversationSchema = z.object({
   participants: z.array(z.string().nonempty()).min(2),
   type: z.enum([conversationTypes.GROUP, conversationTypes.ONE_TO_ONE]),
   groupName: z.string().nonempty().optional(),
   groupPicKey: z.string().optional(),
});

export type CreateConversationInputDTO = z.infer<typeof createConversationSchema>;
