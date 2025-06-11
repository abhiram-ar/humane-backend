import { internalController } from '@di/controller/internalController.container';
import express from 'express';

const internalRouter = express.Router();

internalRouter.get('/user/:userId/friends', internalController.getAllFriends);
internalRouter.get('/relationship/status', internalController.getRelationshipStatus);

export default internalRouter;
