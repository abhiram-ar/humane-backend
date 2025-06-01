import { FriendReqNotificationService } from '@application/usercase/FriendReqNotificationService.usecase';
import { notificationRespository } from '@di/repository.container';

export const friendReqNotificationService = new FriendReqNotificationService(
   notificationRespository
);
