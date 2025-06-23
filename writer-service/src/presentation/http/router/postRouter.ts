import { commentController, likeController, postController } from '@di/controller.container';
import express from 'express';
import { isAuthenticated } from 'humane-common';

const postRouter = express.Router();

postRouter.post('/', isAuthenticated, postController.createPost);
postRouter.delete('/:postId', isAuthenticated, postController.deletePost);

postRouter.post('/pre-signed-url/posterKey', isAuthenticated, postController.getPresingedPosterURL);

postRouter.post('/:postId/comment', isAuthenticated, commentController.createComment);
postRouter.delete('/:postId/comment/:commentId', isAuthenticated, commentController.deleteComment);

postRouter.post('/comment/:commentId/like', isAuthenticated, likeController.addCommentLikeRequest);
postRouter.post('/comment/:commentId/unlike', isAuthenticated, likeController.commnetUnlikeRequest);
export default postRouter;
