import { commentController, postController } from '@di/controller.container';
import express from 'express';
import { isAuthenticated } from 'humane-common';

const postRouter = express.Router();

postRouter.post('/', isAuthenticated, postController.createPost);
postRouter.post('/:postId', isAuthenticated, postController.deletePost);

postRouter.post('/pre-signed-url/posterKey', isAuthenticated, postController.getPresingedPosterURL);

postRouter.post('/:postId/comment', isAuthenticated, commentController.createComment);
postRouter.delete('/:postId/comment/:commentId', isAuthenticated, commentController.deleteComment);

export default postRouter;
