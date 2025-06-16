import { FeedController } from '@presentation/http/controller/Feed.controller';
import { esProxyService, timelineServices } from './services.container';

export const timelineController = new FeedController(timelineServices, esProxyService);
