import { z } from 'zod';

const bulkCommentLikeInsertInputSchema = z.array(
   z.object({ commentId: z.string().nonempty(), authorId: z.string().nonempty() })
);

export type BulkCommnetLikeInsertInputDTO = z.infer<typeof bulkCommentLikeInsertInputSchema>;
