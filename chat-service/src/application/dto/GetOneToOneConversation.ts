import z from 'zod';

export const getOneToOneConversationInputSchema = z.object({
   participants: z.tuple([z.string().nonempty(), z.string().nonempty()]),
});

export type GetOneToOneConversationInputDTO = z.infer<typeof getOneToOneConversationInputSchema>
