import { userRelationshipController } from '@di/controller/userController.container';
import express from 'express';
import { authorizedRoles, isAuthenticatedV2 } from 'humane-common';

const relationshipRouter = express.Router();

relationshipRouter.get(
   '/rel-status',
   isAuthenticatedV2,
   authorizedRoles('user'),
   userRelationshipController.getRelationshipStatus
);

relationshipRouter.get(
   '/friend-req/sent',
   isAuthenticatedV2,
   authorizedRoles('user'),
   userRelationshipController.getUserSendFriendRequestList
);

// ---- friend-req
relationshipRouter.get(
   '/friend-req',
   isAuthenticatedV2,
   authorizedRoles('user'),
   userRelationshipController.getFriendRequestList
);
relationshipRouter.get(
   '/friend-req/count',
   isAuthenticatedV2,
   authorizedRoles('user'),
   userRelationshipController.getFriendsRequestCount
);
relationshipRouter.post(
   '/friend-req',
   isAuthenticatedV2,
   authorizedRoles('user'),
   userRelationshipController.sendFriendRequest
);
relationshipRouter.patch(
   '/friend-req/status',
   isAuthenticatedV2,
   authorizedRoles('user'),
   userRelationshipController.acceptFriendRequest
);
relationshipRouter.delete(
   '/friend-req',
   isAuthenticatedV2,
   authorizedRoles('user'),
   userRelationshipController.cancelFriendRequest
);
relationshipRouter.delete(
   '/friend-req/decline/:targetUserId',
   isAuthenticatedV2,
   authorizedRoles('user'),
   userRelationshipController.declineFriendReq
);

//-----friend
relationshipRouter.get(
   '/friend',
   isAuthenticatedV2,
   authorizedRoles('user'),
   userRelationshipController.getFriendList
);
relationshipRouter.delete(
   '/friend/:targetUserId',
   isAuthenticatedV2,
   authorizedRoles('user'),
   userRelationshipController.removeFriendship
);

relationshipRouter.get(
   '/friend/count',
   isAuthenticatedV2,
   authorizedRoles('user'),
   userRelationshipController.getFriendsCount
);

relationshipRouter.get(
   '/friend/mutual',
   isAuthenticatedV2,
   authorizedRoles('user'),
   userRelationshipController.getMutualFriendsList
);
relationshipRouter.get(
   '/friend/mutual/count',
   isAuthenticatedV2,
   authorizedRoles('user'),
   userRelationshipController.getMutualFriendsCount
);

export default relationshipRouter;
