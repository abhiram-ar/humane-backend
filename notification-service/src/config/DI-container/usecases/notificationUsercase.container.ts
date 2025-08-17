import { CommentLikesNotificationService } from '@application/usercase/CommentLikesNotificationService.usecase';
import { FriendReqAcceptedNotificationService } from '@application/usercase/FriendReqAcceptedNotificationService.usercase';
import { FriendReqNotificationService } from '@application/usercase/FriendReqNotificationService.usecase';
import { PostGotCommentNotificationService } from '@application/usercase/PostGotCommentNotification.usecase';
import { PostModerationNotificationService } from '@application/usercase/PostModerationNotitificationService.usercase';
import { UserNotificationService } from '@application/usercase/UserNotification.usecase';
import { notificationRespository } from '@di/repository.container';
import { elasticSearchProxyService } from '@di/services.contaner';

export const friendReqNotificationService = new FriendReqNotificationService(
   notificationRespository
);

export const friendReqAcceptedNotificationService = new FriendReqAcceptedNotificationService(
   notificationRespository
);

export const userNotificationService = new UserNotificationService(notificationRespository);

export const postGotCommnetNotificationService = new PostGotCommentNotificationService(
   notificationRespository,
   elasticSearchProxyService
);

export const commentLikesNotificationService = new CommentLikesNotificationService(
   notificationRespository,
   elasticSearchProxyService
);

export const postModerationNotificationServices = new PostModerationNotificationService(
   notificationRespository
);
