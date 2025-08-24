import { KafkaPublisher } from '@infrastructure/eventBus/KafkaPublisher';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { ExternalUserServices } from '@infrastructure/services/ExternalUserServices';
import { UserQueryService } from '@infrastructure/services/UserQueryService';

export const eventPubliser = new KafkaPublisher(KafkaSingleton.getInstance());
export const userService = new ExternalUserServices();

export const userQueryService = new UserQueryService()