import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { PostCreatedEventConsumer } from '@presentation/event/consumers/PostCreatedEvent.consumer';
import { timelineServices, userServices } from './services.container';
import { PostDeletedEventConsumer } from '@presentation/event/consumers/PostDeletedEvent.consumer';

export const postcreatedEventConsumer = new PostCreatedEventConsumer(
   KafkaSingleton.getInstance(),
   timelineServices,
   userServices
);

export const postDeletedEventComsumer = new PostDeletedEventConsumer(
   KafkaSingleton.getInstance(),
   timelineServices
);
