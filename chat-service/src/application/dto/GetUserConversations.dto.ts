import z from 'zod';

export const getUserConversaionsInputSchema = z.object({
   userId: z.string().nonempty(),
   from: z.string().nullable(),
   limit: z.number().positive(),
});

export type GetUserConversationInputDTO = z.infer<typeof getUserConversaionsInputSchema>
