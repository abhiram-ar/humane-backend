import { FeedServices } from '@services/feed.services';
import { timelineRepository } from './repository.container';
import { UserServices } from '@infrastructure/services/user-service/UserServices';

export const timelineServices = new FeedServices(timelineRepository);
export const userServices = new UserServices();
