import { z } from 'zod';

export const bulkUpdateCommentLikeCountSchema = z.array(
   z.object({ commentId: z.string().nonempty(), likeCountDiff: z.number() })
);

export type BulkUpdateCommentLikeCountInputDTO = z.infer<typeof bulkUpdateCommentLikeCountSchema>;
