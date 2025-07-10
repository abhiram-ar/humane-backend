import { conversationController } from '@di/controller.container';
import express from 'express';
import { isAuthenticated } from 'humane-common';

const chatRouter = express.Router();

chatRouter.post('/convo', conversationController.createConversation);
chatRouter.get('/recent', isAuthenticated, conversationController.getUserRecentConversations);

export default chatRouter;
