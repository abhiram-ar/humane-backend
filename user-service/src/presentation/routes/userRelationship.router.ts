import { userRelationshipController } from '@di/controller/userController.container';
import express from 'express';

const relationshipRouter = express.Router();

relationshipRouter.post('/send-friend-req', userRelationshipController.sendFriendRequest);
relationshipRouter.get('/friend-req', userRelationshipController.getFriendRequestList);

export default relationshipRouter;
