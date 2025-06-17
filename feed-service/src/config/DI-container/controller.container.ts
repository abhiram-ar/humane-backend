import { FeedController } from '@presentation/http/controller/Feed.controller';
import { esProxyService, feedServices } from './services.container';
import { feedCache } from './cache.container';

export const timelineController = new FeedController(feedServices, esProxyService, feedCache);
