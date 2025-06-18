import { AppendPostToMultipleUserTimelineInputDTO } from '@dtos/AppendPostToMultipleUserTimeline.dto';
import { GetFeedInputDTO } from '@dtos/getFeed.dto';

export interface IFeedCache {
   getUserFeed(dto: GetFeedInputDTO): Promise<{ value: string; score: number }[]>;
   addPostToUserFeed(dto: GetFeedInputDTO): Promise<void>;
   upsetPostToMultipleUserFeed(dto: AppendPostToMultipleUserTimelineInputDTO): Promise<void>;
}
