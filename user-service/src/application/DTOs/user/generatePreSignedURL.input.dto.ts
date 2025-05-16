import z from 'zod';

export const generatePresignedURLInputSchema = z.object({
   fileName: z.string().nonempty(),
   mimeType: z.string().nonempty(),
});

export type GeneratePresignedURLInputDTO = z.infer<typeof generatePresignedURLInputSchema>;
