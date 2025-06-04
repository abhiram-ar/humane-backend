import { userNotificationController } from '@di/controller.container';
import express from 'express';
import { authorizedRoles, isAuthenticated } from 'humane-common';

const userNotificationRouter = express.Router();

userNotificationRouter.get(
   '/',
   isAuthenticated,
   authorizedRoles('user'),
   userNotificationController.getRecentNotifications
);

export default userNotificationRouter;
