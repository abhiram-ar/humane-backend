import { FriendReqAcceptedNotificationService } from '@application/usercase/FriendReqAcceptedNotificationService.usercase';
import { FriendReqNotificationService } from '@application/usercase/FriendReqNotificationService.usecase';
import { UserNotificationService } from '@application/usercase/UserNotification.usecase';
import { notificationRespository } from '@di/repository.container';

export const friendReqNotificationService = new FriendReqNotificationService(
   notificationRespository
);

export const friendReqAcceptedNotificationService = new FriendReqAcceptedNotificationService(
   notificationRespository
);

export const userNotificationService = new UserNotificationService(notificationRespository);
