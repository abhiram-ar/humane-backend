import { TimelineServices } from '@services/Timeline.services';
import { timelineRepository } from './repository.container';
import { UserServices } from '@infrastructure/services/user-service/UserServices';

export const timelineServices = new TimelineServices(timelineRepository);
export const userServices = new UserServices();
