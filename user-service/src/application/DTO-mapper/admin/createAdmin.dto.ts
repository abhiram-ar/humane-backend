import z from 'zod';

export const createAdminSchema = z.object({
   email: z.string().nonempty().email(),
   firstName: z.string().nonempty(),
   lastName: z.string().optional(),
   passwordHash: z.string().nonempty(),
});

export type createAdminDTO = z.infer<typeof createAdminSchema>;
