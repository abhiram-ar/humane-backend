import { conversationController, messsageController } from '@di/controller.container';
import express from 'express';
import { isAuthenticatedV2 } from 'humane-common';

const chatRouter = express.Router();

chatRouter.get('/recent', isAuthenticatedV2, conversationController.getUserRecentConversations);

chatRouter.post('/convo', conversationController.createConversation);

chatRouter.get(
   '/convo/one-to-one',
   isAuthenticatedV2,
   conversationController.getOneToOneConversation
);

chatRouter.get(
   '/convo/one-to-one/messages',
   isAuthenticatedV2,
   messsageController.getOneToOneConvoMessages
);

chatRouter.get('/convo/search', isAuthenticatedV2, conversationController.searchUserConvo);

chatRouter.get('/convo/:convoId', isAuthenticatedV2, conversationController.getUserConvoById);

chatRouter.patch(
   '/convo/:convoId/clearedAt',
   isAuthenticatedV2,
   conversationController.setUserConvoClearedAt
);

export default chatRouter;
