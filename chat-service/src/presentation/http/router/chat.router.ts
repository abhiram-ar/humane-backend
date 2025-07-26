import { conversationController, messsageController } from '@di/controller.container';
import express from 'express';
import { isAuthenticated } from 'humane-common';

const chatRouter = express.Router();

chatRouter.get('/recent', isAuthenticated, conversationController.getUserRecentConversations);

chatRouter.post('/convo', conversationController.createConversation);

chatRouter.get(
   '/convo/one-to-one',
   isAuthenticated,
   conversationController.getOneToOneConversation
);

chatRouter.get('/convo/search', isAuthenticated, conversationController.searchUserConvo);

chatRouter.get('/convo/:convoId', isAuthenticated, conversationController.getUserConvoById);

chatRouter.get(
   '/convo/one-to-one/messages',
   isAuthenticated,
   messsageController.getOneToOneConvoMessages
);

export default chatRouter;
