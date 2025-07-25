import z from 'zod';

export const setConvoLastOpenedInputSchema = z.object({
   conversationId: z.string().nonempty(),
   userId: z.string().nonempty(),
   time: z.date(),
});

export type SetConvoLastOpenedInputDTO = z.infer<typeof setConvoLastOpenedInputSchema>;
