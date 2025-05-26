import { userRelationshipController } from '@di/controller/userController.container';
import express from 'express';

const relationshipRouter = express.Router();

relationshipRouter.post('/send-friend-req', userRelationshipController.sendFriendRequest);

export default relationshipRouter;
