import z from 'zod';

export const createOneToOneMessageSchema = z.object({
   from: z.string(),
   to: z.string(),
   message: z.string().optional(),
   attachment: z
      .object({
         attachmentType: z.string().nonempty(),
         attachmentKey: z.string().nonempty(),
      })
      .optional(),
});

export type CreateOneToOneMessageInputDTO = z.infer<typeof createOneToOneMessageSchema>;
