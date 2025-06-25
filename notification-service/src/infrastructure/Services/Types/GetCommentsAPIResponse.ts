import { Comment } from '@application/dtos/Comment.dto';

export type GetCommentsAPIResponse = {
   data: { comments: (Comment | null)[] };
};
