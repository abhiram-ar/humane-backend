import { PostController } from '@presentation/http/controller/Post.controller';
import {
   commentServices,
   eventPubliser,
   likeServices,
   postService,
   storageService,
} from './services.container';
import { CommentController } from '@presentation/http/controller/Comment.controller';
import { LikeController } from '@presentation/http/controller/Like.controller';
import { InternalController } from '@presentation/http/controller/Internal.controller';

export const postController = new PostController(
   postService,
   eventPubliser,
   storageService,
   commentServices
);
export const commentController = new CommentController(commentServices, eventPubliser);

export const likeController = new LikeController(eventPubliser);

export const internalController = new InternalController(commentServices, likeServices);
