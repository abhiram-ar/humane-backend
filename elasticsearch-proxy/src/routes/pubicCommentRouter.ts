import { publicCommentController } from '@di/controllers';
import { Router } from 'express';

const publicCommentRouter = Router();

publicCommentRouter.get('/:postId', publicCommentController.getPostComments);

export default publicCommentRouter;
