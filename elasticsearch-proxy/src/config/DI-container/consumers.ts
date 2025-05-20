import { UserProfileEventsConsumer } from 'consumers/UserProfileEvent.consumer';
import KafkaSingleton from 'kafka/KafkaSingleton';
import { userServices } from './services';

export const userProfileConsumer = new UserProfileEventsConsumer(
   KafkaSingleton.getInstance(),
   userServices
);
