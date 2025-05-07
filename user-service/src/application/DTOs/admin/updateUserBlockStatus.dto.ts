import z from 'zod';

export const updateuserblockStatusSchema = z.object({
   userId: z.string().nonempty(),
   newBlockStatus: z.boolean(),
});

export type UpdateUserBlockStatusDTO = z.infer<typeof updateuserblockStatusSchema>;
