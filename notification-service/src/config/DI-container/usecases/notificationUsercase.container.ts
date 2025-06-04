import { FriendReqNotificationService } from '@application/usercase/FriendReqNotificationService.usecase';
import { UserNotificationService } from '@application/usercase/UserNotification.usecase';
import { notificationRespository } from '@di/repository.container';

export const friendReqNotificationService = new FriendReqNotificationService(
   notificationRespository
);

export const userNotificationService = new UserNotificationService(notificationRespository);
