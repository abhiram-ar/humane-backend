import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { PostModerationCompletedEventConsumer } from '@presentation/event/consumers/PostModertionCompletedEvent.consumer';
import { feedServices, userServices } from './services.container';
import { PostDeletedEventConsumer } from '@presentation/event/consumers/PostDeletedEvent.consumer';
import { feedCache } from './cache.container';

export const postModerationCompletedEventConsumer = new PostModerationCompletedEventConsumer(
   KafkaSingleton.getInstance(),
   feedServices,
   userServices,
   feedCache
);

export const postDeletedEventComsumer = new PostDeletedEventConsumer(
   KafkaSingleton.getInstance(),
   feedServices
);
