import { FeedController } from '@presentation/http/controller/Feed.controller';
import { timelineServices } from './services.container';

export const timelineController = new FeedController(timelineServices);
