import { z } from 'zod';

export const generatePresignedURLSchema = z.object({
   userId: z.string().nonempty(),
   fileName: z.string().nonempty(),
   fileType: z.string().nonempty(),
});

export type GeneratePresignedURLInputDTO = z.infer<typeof generatePresignedURLSchema>;
