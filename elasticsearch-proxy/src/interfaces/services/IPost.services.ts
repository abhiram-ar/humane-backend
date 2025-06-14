import { HydrartePostDetailsInputDTO } from 'interfaces/dto/post/HydratePostDetails.dto';
import { PostInputDTO } from 'interfaces/dto/post/Post.dto';

import { IPostDocument, PostVisibility } from 'interfaces/IPostDocument';
import { GetUserTimelineInputDTO } from 'interfaces/dto/post/GetUserTimeline.dto';

export interface IPostService {
   upsert(dto: PostInputDTO): Promise<void>;

   delete(postId: string): Promise<void>;

   getPostByIds(
      postIds: HydrartePostDetailsInputDTO
   ): Promise<((Omit<IPostDocument, 'posterKey'> & { posterURL: string | null }) | null)[]>;

   getUserTimeline(
      dto: GetUserTimelineInputDTO,
      filter: (typeof PostVisibility)[keyof typeof PostVisibility] | undefined
   ): Promise<{
      posts: (Omit<IPostDocument, 'posterKey'> & { posterURL: string | null })[];
      pagination: { from: string | null; hasMore: boolean };
   }>;
}
