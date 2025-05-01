import z from 'zod';

export const createAnonSchema = z.object({
   userId: z.string().nonempty(),
   anonId: z.string().nonempty(),
   expiresAt: z
      .number()
      .int()
      .refine((epoch) => epoch > Date.now(), { message: 'anonId expiry cannot be in past' }),
   createdAt: z.number().int().gte(0),
});

export type createAnonDTO = z.infer<typeof createAnonSchema>;
