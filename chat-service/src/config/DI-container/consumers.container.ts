import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { RepliedWithinResonableTimeWorker } from '@presentation/eventBus/consumers/RepliedWithinResonsableTimeWorker';
import { repliedWithin24Hrs } from './usecases.container';
import { cacheService, eventPubliser } from './services.container';

export const repliedWithinResonableTimeWorkerConsumer = new RepliedWithinResonableTimeWorker(
   KafkaSingleton.getInstance(),
   repliedWithin24Hrs,
   eventPubliser,
   cacheService
);
