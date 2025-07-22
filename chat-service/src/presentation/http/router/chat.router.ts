import { conversationController, messsageController } from '@di/controller.container';
import express from 'express';
import { isAuthenticated } from 'humane-common';

const chatRouter = express.Router();

chatRouter.post('/convo', conversationController.createConversation);

chatRouter.get(
   '/convo/one-to-one/',
   isAuthenticated,
   conversationController.getOneToOneConversation
);

chatRouter.get(
   '/convo/one-to-one/messages',
   isAuthenticated,
   messsageController.getOneToOneConvoMessages
);

chatRouter.get('/recent', isAuthenticated, conversationController.getUserRecentConversations);

export default chatRouter;
