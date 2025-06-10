import { ITimelineRepository } from '@domain/interfaces/ITimelineRepository';
import { TimelinePost } from '@domain/TimelinePost.entity';

export class TimelineServices {
   constructor(private readonly _timelineRepo: ITimelineRepository) {}

   appendPost = async (dto: {
      userId: string;
      postId: string;
      authorId: string;
   }): Promise<Required<TimelinePost>> => {
      const timelinePost = new TimelinePost(dto.userId, dto.postId, dto.authorId);

      return this._timelineRepo.upsertPost(timelinePost);
   };

   removeAuthorPostsFromTimeline = (dto: { userId: string; authorId: string }) => {
      return this._timelineRepo.removeAuthorPostsFromTimeline(dto.userId, dto.authorId);
   };
}
