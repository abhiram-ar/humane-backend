import { publicCommentController, publicPostQueryController } from '@di/controllers';
import { Router } from 'express';
import { AuthenticateWithNoErrorV2, isAuthenticatedV2 } from 'humane-common';

const publicPostRouter = Router();

publicPostRouter.get(
   '/timeline/:targetUserId',
   isAuthenticatedV2,
   publicPostQueryController.getUserTimeline
);

publicPostRouter.get(
   '/:postId',
   AuthenticateWithNoErrorV2,
   publicPostQueryController.postFullDetails
);

publicPostRouter.get(
   '/:postId/comment',
   AuthenticateWithNoErrorV2,
   publicCommentController.getPostComments
);

publicPostRouter.get('/hashtag/:hashtag', publicPostQueryController.queryPostByHashtag);

export default publicPostRouter;
