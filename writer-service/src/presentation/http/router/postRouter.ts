import { postController } from '@di/controller.container';
import express from 'express';
import { isAuthenticated } from 'humane-common';

const postRouter = express.Router();

postRouter.post('/', isAuthenticated, postController.createPost);
postRouter.post('/:postId', isAuthenticated, postController.deletePost);

export default postRouter;
