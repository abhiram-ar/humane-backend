import { ITimelineRepository } from '@domain/interfaces/ITimelineRepository';
import { TimelinePost } from '@domain/TimelinePost.entity';

export class TimelineServices {
   constructor(private readonly _timelineRepo: ITimelineRepository) {}

   appendPostToMultipleUserTimeline = async (dto: {
      userIds: string[];
      postId: string;
      authorId: string;
   }) => {
      const timelinePosts = dto.userIds.map(
         (userId) => new TimelinePost(userId, dto.postId, dto.authorId)
      );

      this._timelineRepo.bulkUpsertTimelinePost(timelinePosts);
   };

   removeAuthorPostsFromTimeline = (dto: { userId: string; authorId: string }) => {
      return this._timelineRepo.removeAuthorPostsFromTimeline(dto.userId, dto.authorId);
   };
}
