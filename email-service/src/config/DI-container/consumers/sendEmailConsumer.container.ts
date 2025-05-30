import KafkaSingleton from '@infrastructure/event-bus/KafkaSingleton';
import { UserSingupEventConsumer } from '@presentation/event/consumers/UserSignupEvent.consumer';
import { UserPasswordRecoveryRequestEventConsumer } from '@presentation/event/consumers/UserPasswordRecoveryRequestEvent.consumer';
import {
   sendPasswordRecoveryMail,
   sendVerificationMail,
} from '@DI-container/usecases/emailUsecase.container';

export const userPasswordRecoveryRequestEventConsumer =
   new UserPasswordRecoveryRequestEventConsumer(
      sendPasswordRecoveryMail,
      KafkaSingleton.getInstance()
   );

export const useSignupEventConsumer = new UserSingupEventConsumer(
   KafkaSingleton.getInstance(),
   sendVerificationMail
);
