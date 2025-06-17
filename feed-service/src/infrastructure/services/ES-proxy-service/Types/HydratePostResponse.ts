import { HydratedPost } from '@application/Types/HydratedPost';

export type HydratePostsAPIResponse = {
   message: string;
   data: {
      posts: (HydratedPost | null)[];
   };
};
