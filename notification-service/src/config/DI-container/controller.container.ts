import { UserNotificationController } from '@presentation/http/controller/UserNotification.controller';
import { userNotificationService } from './usecases/notificationUsercase.container';
import { elasticSearchProxyService } from './services.contaner';

export const userNotificationController = new UserNotificationController(
   userNotificationService,
   elasticSearchProxyService
);
