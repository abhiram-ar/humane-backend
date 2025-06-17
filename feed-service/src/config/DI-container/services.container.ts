import { ESProxyService } from '@infrastructure/services/ES-proxy-service/ESProxyService';
import { UserServices } from '@infrastructure/services/user-service/UserServices';
import { FeedServices } from '@services/Feed.services';
import { timelineRepository } from './repository.container';

export const userServices = new UserServices();

export const esProxyService = new ESProxyService();

export const feedServices = new FeedServices(timelineRepository);
