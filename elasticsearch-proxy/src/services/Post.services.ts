import { logger } from '@config/logger';
import { HydrartePostDetailsInputDTO } from 'interfaces/dto/post/HydratePostDetails.dto';
import { PostInputDTO } from 'interfaces/dto/post/Post.dto';
import { IPostRepository } from 'interfaces/repository/IPostRepository';
import { CDNService } from './CDN.services';
import { IPostDocument, PostVisibility } from 'interfaces/IPostDocument';
import { GetUserTimelineInputDTO } from 'interfaces/dto/post/GetUserTimeline.dto';
import { IPostService } from 'interfaces/services/IPost.services';

export class PostService implements IPostService {
   constructor(
      private readonly _postRepo: IPostRepository,
      private readonly _cdnService: CDNService
   ) {}

   upsert = async (dto: PostInputDTO): Promise<void> => {
      // if events are retried
      const exisingPost = await this._postRepo.getUpdatedAt(dto.id);
      if (!exisingPost) {
         await this._postRepo.create(dto);
         return;
      }

      if (new Date(dto.updatedAt) > new Date(exisingPost.updatedAt)) {
         await this._postRepo.replace(dto.id, dto);
         return;
      } else logger.warn('Skipping post creation since incommiing document is old');
   };

   delete = async (postId: string): Promise<void> => {
      const res = await this._postRepo.deleteById(postId);

      if (!res.found) {
         logger.warn(`Cannot find post ${postId} to delete`);
      }
      if (res.found && !res.deleted) {
         logger.error(`Unable to delete post ${postId}`);
      }
   };

   getPostByIds = async (
      postIds: HydrartePostDetailsInputDTO
   ): Promise<((Omit<IPostDocument, 'posterKey'> & { posterURL: string | null }) | null)[]> => {
      const posts = await this._postRepo.getByIds(postIds);

      const MediaURLhydratedPosts = posts.map((post) => {
         if (!post) return null;

         const { posterKey, ...data } = post;
         let posterURL: string | null = null;
         if (posterKey) {
            posterURL = this._cdnService.getPublicCDNURL(posterKey);
         }

         return { ...data, posterURL };
      });

      return MediaURLhydratedPosts;
   };

   getUserTimeline = async (
      dto: GetUserTimelineInputDTO,
      filter: (typeof PostVisibility)[keyof typeof PostVisibility] | undefined = undefined
   ): Promise<{
      posts: (Omit<IPostDocument, 'posterKey'> & { posterURL: string | null })[];
      pagination: { from: string | null; hasMore: boolean };
   }> => {
      const res = await this._postRepo.getUserPosts(
         dto.targetUserId,
         dto.from ?? null,
         dto.limit,
         filter
      );

      const postURLHydratedPosts = res.posts.map((post) => {
         const { posterKey, ...data } = post;

         let posterURL: string | null = null;
         if (posterKey) {
            posterURL = this._cdnService.getPublicCDNURL(posterKey);
         }

         return { ...data, posterURL };
      });

      return { posts: postURLHydratedPosts, pagination: { from: res.from, hasMore: res.hasMore } };
   };
}
