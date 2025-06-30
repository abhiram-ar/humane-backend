import { HydrartePostDetailsInputDTO } from 'interfaces/dto/post/HydratePostDetails.dto';
import { PostInputDTO } from 'interfaces/dto/post/Post.dto';

import { IPostDocument } from 'interfaces/IPostDocument';
import { GetUserTimelineInputDTO } from 'interfaces/dto/post/GetUserTimeline.dto';
import { PostVisibility } from 'humane-common';

export interface IPostService {
   upsert(dto: PostInputDTO): Promise<void>;

   delete(postId: string): Promise<void>;

   getPostByIds(
      postIds: HydrartePostDetailsInputDTO
   ): Promise<
      ((Omit<IPostDocument, 'processedAttachmentKey'> & { attachmentURL: string | null }) | null)[]
   >;
   getUserTimeline(
      dto: GetUserTimelineInputDTO,
      filter: (typeof PostVisibility)[keyof typeof PostVisibility] | undefined
   ): Promise<{
      posts: (Omit<IPostDocument, 'processedAttachmentKey'> & { attachmentURL: string | null })[];
      pagination: { from: string | null; hasMore: boolean };
   }>;

   bulkUpdateCommentsCount(dto: { postId: string; delta: number }[]): Promise<{ ack: boolean }>;
}
