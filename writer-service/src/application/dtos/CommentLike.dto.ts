import { CommentLikeEventPayload } from 'humane-common';
import { z } from 'zod';

export const commnetLikeSchema = z.object({
   authorId: z.string().nonempty(),
   commentId: z.string().nonempty(),
   createdAt: z.coerce.date(),
   updatedAt: z.coerce.date(),
});

export type CommnetLikeDTO = z.infer<typeof commnetLikeSchema>;
const assetTypeCompatability: <T extends CommentLikeEventPayload>() => void = () => {};
assetTypeCompatability<CommnetLikeDTO>();
