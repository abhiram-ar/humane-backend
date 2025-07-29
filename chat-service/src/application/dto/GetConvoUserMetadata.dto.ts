import z from 'zod';

export const getCovoUserMetadataInputSchema = z.object({
   userId: z.string().nonempty(),
   convoId: z.string().nonempty(),
});

export type GetCovoUserMetadataInputDTO = z.infer<typeof getCovoUserMetadataInputSchema>;
