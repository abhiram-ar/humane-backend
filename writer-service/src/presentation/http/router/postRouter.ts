import { commentController, likeController, postController } from '@di/controller.container';
import express from 'express';
import {  isAuthenticatedV2 } from 'humane-common';

const postRouter = express.Router();

postRouter.post('/', isAuthenticatedV2, postController.createPost);
postRouter.delete('/:postId', isAuthenticatedV2, postController.deletePost);

postRouter.post('/pre-signed-url/posterKey', isAuthenticatedV2, postController.getPresingedPosterURL);

postRouter.post('/:postId/comment', isAuthenticatedV2, commentController.createComment);
postRouter.delete('/:postId/comment/:commentId', isAuthenticatedV2, commentController.deleteComment);

postRouter.post('/comment/:commentId/like', isAuthenticatedV2, likeController.addCommentLikeRequest);
postRouter.post('/comment/:commentId/unlike', isAuthenticatedV2, likeController.commnetUnlikeRequest);
export default postRouter;
