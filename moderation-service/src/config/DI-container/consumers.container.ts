import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { PostCreatedEventConsumer } from '@presentation/eventBus/consumers/PostCreatedEvent.consumer';
import { eventPublisher, moderationService } from './services.container';

export const postCreatedEventConsumer = new PostCreatedEventConsumer(
   KafkaSingleton.getInstance(),
   moderationService,
   eventPublisher
);
