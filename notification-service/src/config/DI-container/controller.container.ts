import { UserNotificationController } from '@presentation/http/controller/UserNotification.controller';
import { userNotificationService } from './usecases/notificationUsercase.container';
import { elasticSearchProxyService } from './services.contaner';
import { AdminController } from '@presentation/http/controller/Admin.controller';

export const userNotificationController = new UserNotificationController(
   userNotificationService,
   elasticSearchProxyService
);

export const adminController = new AdminController();
