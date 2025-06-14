import { PostController } from '@presentation/http/controller/Post.controller';
import { commentServices, eventPubliser, postService, storageService } from './services.container';
import { CommentController } from '@presentation/http/controller/Comment.controller';

export const postController = new PostController(
   postService,
   eventPubliser,
   storageService,
   commentServices
);
export const commentController = new CommentController(commentServices, eventPubliser);
