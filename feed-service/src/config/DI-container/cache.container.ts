import { FeedCache } from '@infrastructure/cache/redis/FeedCache';
import { feedServices } from './services.container';

export const feedCache = new FeedCache(feedServices);
