import { timelineController } from '@di/controller.container';
import express from 'express';
import { isAuthenticated } from 'humane-common';

const feedRouter = express.Router();

feedRouter.get('/', isAuthenticated, timelineController.getTimeline);
export default feedRouter;
