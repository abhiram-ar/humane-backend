import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { PostCreatedEventConsumer } from '@presentation/event/consumers/PostCreatedEvent.consumer';
import { timelineServices, userServices } from './services.container';

export const postcreatedEventConsumer = new PostCreatedEventConsumer(
   KafkaSingleton.getInstance(),
   timelineServices,
   userServices
);
