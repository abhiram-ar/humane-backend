import { z } from 'zod';

const bulkCommentUnlikeInputSchema = z.array(
   z.object({ commentId: z.string().nonempty(), authorId: z.string().nonempty() })
);

export type BulkCommnetUnlikeInputDTO = z.infer<typeof bulkCommentUnlikeInputSchema>;
