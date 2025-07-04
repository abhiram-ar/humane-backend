import { KafkaPublisher } from '@infrastructure/eventBus/KafkaPublisher';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { ExternalUserServices } from '@infrastructure/services/ExternalUserServices';

export const eventPubliser = new KafkaPublisher(KafkaSingleton.getInstance());
export const userService = new ExternalUserServices();
