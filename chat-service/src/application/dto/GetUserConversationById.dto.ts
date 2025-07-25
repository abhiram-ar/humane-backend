import z from 'zod';

export const getUserConvoByIdInputSchema = z.object({
   userId: z.string().nonempty(),
   convoId: z.string().nonempty(),
});

export type GetUserCovoByIdInputDTO = z.infer<typeof getUserConvoByIdInputSchema>;
