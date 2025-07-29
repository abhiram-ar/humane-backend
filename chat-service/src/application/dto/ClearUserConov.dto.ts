import z from 'zod';

export const clearUserConovInputSchema = z.object({
   userId: z.string().nonempty(),
   convoId: z.string().nonempty(),
});

export type ClearUserConvoInputDTO = z.infer<typeof clearUserConovInputSchema>;
