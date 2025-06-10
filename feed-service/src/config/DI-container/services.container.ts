import { TimelineServices } from '@services/Timeline.services';
import { timelineRepository } from './repository.container';

export const timelineServices = new TimelineServices(timelineRepository);
