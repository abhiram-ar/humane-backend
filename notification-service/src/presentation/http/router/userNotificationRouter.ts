import { userNotificationController } from '@di/controller.container';
import express from 'express';
import { authorizedRoles, isAuthenticatedV2 } from 'humane-common';

const userNotificationRouter = express.Router();

userNotificationRouter.get(
   '/',
   isAuthenticatedV2,
   authorizedRoles('user'),
   userNotificationController.getRecentNotifications
);

userNotificationRouter.patch(
   '/isRead',
   isAuthenticatedV2,
   authorizedRoles('user'),
   userNotificationController.markAsReadFrom
);

export default userNotificationRouter;
