import { conversationController } from '@di/controller.container';
import express from 'express';

const chatRouter = express.Router();

chatRouter.post('/convo', conversationController.createConversation);

export default chatRouter;
