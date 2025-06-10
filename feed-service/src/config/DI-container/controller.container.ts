import { TimelineController } from '@presentation/http/controller/Timeline.controller';
import { timelineServices } from './services.container';

export const timelineController = new TimelineController(timelineServices);
