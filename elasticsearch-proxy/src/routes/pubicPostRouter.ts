import { publicPostQueryController } from '@di/controllers';
import { Router } from 'express';
import { isAuthenticated } from 'humane-common';

const publicPostRouter = Router();

publicPostRouter.get(
   '/timeline/:targetUserId',
   isAuthenticated,
   publicPostQueryController.getUserTimeline
);

export default publicPostRouter;
