import { FeedServices } from '@services/feed.services';
import { timelineRepository } from './repository.container';
import { UserServices } from '@infrastructure/services/user-service/UserServices';
import { ESProxyService } from '@infrastructure/services/ES-proxy-service/ESProxyService';

export const timelineServices = new FeedServices(timelineRepository);
export const userServices = new UserServices();

export const esProxyService = new ESProxyService();
