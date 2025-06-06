import { PostController } from '@presentation/http/controller/Post.controller';
import { commentServices, postService } from './services.container';
import { CommentController } from '@presentation/http/controller/Comment.controller';

export const postController = new PostController(postService);
export const commentController = new CommentController(commentServices);
