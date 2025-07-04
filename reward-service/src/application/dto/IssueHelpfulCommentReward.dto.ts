import { CommentLikedByPostAuthorPayload } from 'humane-common';
import z from 'zod';

export const issueHelpfulCommentRewardInputSchema = z.object({
   commentId: z.string().nonempty(),
   commentAutorId: z.string().nonempty(),
   postId: z.string().nonempty(),
   postAuthorId: z.string().nonempty(),
});

export type IssueHelpFulCommentInputDTO = z.infer<typeof issueHelpfulCommentRewardInputSchema>;

const assertTypeCompatability: <T extends CommentLikedByPostAuthorPayload>() => void = () => {};
assertTypeCompatability<IssueHelpFulCommentInputDTO>();
