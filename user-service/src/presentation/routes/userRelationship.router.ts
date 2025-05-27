import { userRelationshipController } from '@di/controller/userController.container';
import { authorizedRoles } from '@presentation/middlewares/authorization.middleware';
import { isAuthenticated } from '@presentation/middlewares/isAuthenticated.middleware';
import express from 'express';

const relationshipRouter = express.Router();

relationshipRouter.post(
   '/friend-req',
   isAuthenticated,
   authorizedRoles('user'),
   userRelationshipController.sendFriendRequest
);
relationshipRouter.get(
   '/friend-req',
   isAuthenticated,
   authorizedRoles('user'),
   userRelationshipController.getFriendRequestList
);
relationshipRouter.patch('/friend-req', userRelationshipController.acceptFriendRequest);
relationshipRouter.delete('/friend-req', userRelationshipController.cancelFriendRequest);

relationshipRouter.get('/friend', isAuthenticated, userRelationshipController.getFriendList);

export default relationshipRouter;
