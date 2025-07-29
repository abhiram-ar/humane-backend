import z from 'zod';

export const searchUserInputSchema = z.object({
   searchQuery: z.string().nonempty(),
   page: z.number().positive('page annot be 0').default(1),
   limit: z.number().positive('limit cannot be 0 or negative').default(10),
});

export type SearchUserInputDTO = z.infer<typeof searchUserInputSchema>;
