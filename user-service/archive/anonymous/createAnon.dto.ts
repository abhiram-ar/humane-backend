import z from 'zod';

export const anonSchema = z.object({
   userId: z.string().nonempty(),
   anonId: z.string().nonempty(),
   expiresAt: z
      .number()
      .int()
      .refine((expiryEpoch) => expiryEpoch > Date.now(), { message: 'anonId expired' }),
   createdAt: z.number().int().gte(0),
   revoked: z.boolean().optional().default(false),
});

export type anonDTO = z.infer<typeof anonSchema>;
