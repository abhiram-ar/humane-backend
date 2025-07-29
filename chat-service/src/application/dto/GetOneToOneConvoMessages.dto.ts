import z from 'zod';

export const getOneToOneConvoMessagesInputSchema = z.object({
   userId: z.string().nonempty(),
   otherUserId: z.string().nonempty(),
   from: z.string().nullable(),
   limit: z.number().positive(),
});

export type GetOneToOneConvoMessagesInputDTO = z.infer<typeof getOneToOneConvoMessagesInputSchema>;
