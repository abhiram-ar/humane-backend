import { ITimelineRepository } from '@domain/interfaces/ITimelineRepository';
import { TimelinePost } from '@domain/TimelinePost.entity';
import { AppendPostToMultipleUserTimelineInputDTO } from '@dtos/AppendPostToMultipleUserTimeline.dto';

export class TimelineServices {
   constructor(private readonly _timelineRepo: ITimelineRepository) {}

   appendPostToMultipleUserTimeline = async (dto: AppendPostToMultipleUserTimelineInputDTO) => {
      const timelinePosts = dto.userIds.map(
         (userId) => new TimelinePost(userId, dto.postId, dto.authorId, dto.createdAt)
      );

      this._timelineRepo.bulkUpsertTimelinePost(timelinePosts);
   };

   removeAuthorPostsUserFromTimeline = (dto: { userId: string; authorId: string }) => {
      return this._timelineRepo.removeAuthorPostsFromUserTimeline(dto.userId, dto.authorId);
   };

   getUserTimelinePaginated = async (dto: {
      userId: string;
      from: string | null;
      limit: number;
   }): Promise<{
      post: Omit<TimelinePost, 'authorId' | 'userId'>[];
      pagination: { from: string | null; hasMore: boolean };
   }> => {
      const timeline = await this._timelineRepo.getUserTimeline(dto.userId, dto.from, dto.limit);

      return {
         post: timeline.post,
         pagination: { from: timeline.from, hasMore: timeline.hasMore },
      };
   };
}
