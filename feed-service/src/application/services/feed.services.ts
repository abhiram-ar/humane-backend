import { IFeedRepository } from '@domain/interfaces/IFeedRepository';
import { FeedPostEntity } from '@domain/FeedPost.entity';
import { AppendPostToMultipleUserTimelineInputDTO } from '@dtos/AppendPostToMultipleUserTimeline.dto';

export class FeedServices {
   constructor(private readonly _timelineRepo: IFeedRepository) {}

   appendPostToMultipleUserFeed = async (dto: AppendPostToMultipleUserTimelineInputDTO) => {
      const timelinePosts = dto.userIds.map(
         (userId) => new FeedPostEntity(userId, dto.postId, dto.authorId, dto.createdAt)
      );

      this._timelineRepo.bulkUpsertTimelinePost(timelinePosts);
   };

   removeAuthorPostsUserFromFeed = (dto: { userId: string; authorId: string }) => {
      return this._timelineRepo.removeAuthorPostsFromUserTimeline(dto.userId, dto.authorId);
   };

   getUserFeedPaginated = async (dto: {
      userId: string;
      from: string | null;
      limit: number;
   }): Promise<{
      post: Omit<FeedPostEntity, 'authorId' | 'userId'>[];
      pagination: { from: string | null; hasMore: boolean };
   }> => {
      const timeline = await this._timelineRepo.getUserTimeline(dto.userId, dto.from, dto.limit);

      return {
         post: timeline.post,
         pagination: { from: timeline.from, hasMore: timeline.hasMore },
      };
   };
}
