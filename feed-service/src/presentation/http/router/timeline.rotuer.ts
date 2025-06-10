import { timelineController } from '@di/controller.container';
import express from 'express';
import { isAuthenticated } from 'humane-common';

const timelineRouter = express.Router();

timelineRouter.get('/', isAuthenticated, timelineController.getTimeline);
export default timelineRouter;
