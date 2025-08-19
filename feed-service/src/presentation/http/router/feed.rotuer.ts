import { timelineController } from '@di/controller.container';
import express from 'express';
import { isAuthenticatedV2 } from 'humane-common';

const feedRouter = express.Router();

feedRouter.get('/', isAuthenticatedV2, timelineController.getTimeline);
export default feedRouter;
