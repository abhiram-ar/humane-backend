import { Comment } from '@domain/entities/Comment.entity';
import { z } from 'zod';

export const getCommentLikeMetaDataForAUserSchema = z.object({
   userId: z.string().nullish().optional(),
   commentIds: z.array(z.string().nonempty()),
});

export type GetCommentLikeMetadataForAUser = z.infer<typeof getCommentLikeMetaDataForAUserSchema>;

export type GetCommentLikeMetadataForAUserResponse = (Pick<
   Required<Comment>,
   'id' | 'likeCount' | 'likedByPostAuthor'
> & { hasLikedByUser?: boolean })[];
