import z from 'zod';

export const deleteUserMessageSchema = z.object({
   userId: z.string().nonempty(),
   messageId: z.string().nonempty(),
});

export type DeleteUserMessageInputDTO = z.infer<typeof deleteUserMessageSchema>;
