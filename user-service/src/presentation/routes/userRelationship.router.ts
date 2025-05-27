import { userRelationshipController } from '@di/controller/userController.container';
import { authorizedRoles } from '@presentation/middlewares/authorization.middleware';
import { isAuthenticated } from '@presentation/middlewares/isAuthenticated.middleware';
import express from 'express';

const relationshipRouter = express.Router();

relationshipRouter.get(
   '/rel-status',
   isAuthenticated,
   authorizedRoles('user'),
   userRelationshipController.getRelationshipStatus
);

// ---- friend-req
relationshipRouter.get(
   '/friend-req',
   isAuthenticated,
   authorizedRoles('user'),
   userRelationshipController.getFriendRequestList
);
relationshipRouter.post(
   '/friend-req',
   isAuthenticated,
   authorizedRoles('user'),
   userRelationshipController.sendFriendRequest
);
relationshipRouter.patch(
   '/friend-req',
   isAuthenticated,
   authorizedRoles('user'),
   userRelationshipController.acceptFriendRequest
);
relationshipRouter.delete(
   '/friend-req',
   isAuthenticated,
   authorizedRoles('user'),
   userRelationshipController.cancelFriendRequest
);

//-----friend
relationshipRouter.get(
   '/friend',
   isAuthenticated,
   authorizedRoles('user'),
   userRelationshipController.getFriendList
);

relationshipRouter.get(
   '/friend/mutual',
   isAuthenticated,
   authorizedRoles('user'),
   userRelationshipController.getMutualFriendsList
);
relationshipRouter.get(
   '/friend/mutual/count',
   isAuthenticated,
   authorizedRoles('user'),
   userRelationshipController.getMutualFriendsCount
);

export default relationshipRouter;
