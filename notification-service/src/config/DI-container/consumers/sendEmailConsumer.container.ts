import { sendPasswordRecoveryMail } from '@DI-container/usecases/emailUsecase.container';
import KafkaSingleton from '@infrastructure/event-bus/KafkaSingleton';
import { UserPasswordRecoveryRequestEventConsumer } from '@presentation/event/consumers/UserPasswordRecoveryRequestEvent.consumer';

export const userPasswordRecoveryRequestEventConsumer = new UserPasswordRecoveryRequestEventConsumer(
   sendPasswordRecoveryMail,
   KafkaSingleton.getInstance()
);
