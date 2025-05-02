import { Anonymous } from '@domain/entities/anon.entity';
import z from 'zod';

export const anonSchema = z
   .object({
      userId: z.string().nonempty(),
      anonId: z.string().nonempty(),
      expiresAt: z
         .number()
         .int()
         .refine((expiryEpoch) => expiryEpoch > Date.now(), { message: 'anonId expired' }),
      createdAt: z.number().int().gte(0),
      revoked: z.boolean().optional().default(false),
   })
   .transform(
      (parsed) =>
         new Anonymous(
            parsed.anonId,
            parsed.userId,
            parsed.expiresAt,
            parsed.createdAt,
            parsed.revoked
         )
   );

export type anonDTO = z.infer<typeof anonSchema>;
