import { publicCommentController, publicPostQueryController } from '@di/controllers';
import { Router } from 'express';
import { AuthenticateWithNoError, isAuthenticated } from 'humane-common';

const publicPostRouter = Router();

publicPostRouter.get(
   '/timeline/:targetUserId',
   isAuthenticated,
   publicPostQueryController.getUserTimeline
);

publicPostRouter.get('/:postId', publicPostQueryController.postFullDetails);

publicPostRouter.get(
   '/:postId/comment',
   AuthenticateWithNoError,
   publicCommentController.getPostComments
);

export default publicPostRouter;
