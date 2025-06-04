import { UserNotificationController } from '@presentation/http/controller/UserNotification.controller';
import { userNotificationService } from './usecases/notificationUsercase.container';

export const userNotificationController = new UserNotificationController(userNotificationService);
