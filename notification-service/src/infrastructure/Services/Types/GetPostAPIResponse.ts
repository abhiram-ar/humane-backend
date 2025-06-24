import { Post } from '@application/Types/PostDetails';

export type GetPostsAPIResponse = {
   message: string;
   data: {
      posts: (Post | null)[];
   };
};
