import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { PostCreatedEventConsumer } from '@presentation/event/consumers/PostCreatedEvent.consumer';
import { feedServices, userServices } from './services.container';
import { PostDeletedEventConsumer } from '@presentation/event/consumers/PostDeletedEvent.consumer';
import { feedCache } from './cache.container';

export const postcreatedEventConsumer = new PostCreatedEventConsumer(
   KafkaSingleton.getInstance(),
   feedServices,
   userServices,
   feedCache
);

export const postDeletedEventComsumer = new PostDeletedEventConsumer(
   KafkaSingleton.getInstance(),
   feedServices
);
