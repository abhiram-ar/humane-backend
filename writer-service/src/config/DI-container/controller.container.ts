import { PostController } from '@presentation/http/controller/Post.controller';
import {
   commentServices,
   eventPubliser,
   hashtagServices,
   likeServices,
   postService,
   postsStat,
   storageService,
} from './services.container';
import { CommentController } from '@presentation/http/controller/Comment.controller';
import { LikeController } from '@presentation/http/controller/Like.controller';
import { InternalController } from '@presentation/http/controller/Internal.controller';
import { HashtagController } from '@presentation/http/controller/Hashtag.controller';
import { AdminController } from '@presentation/http/controller/Admin.Controller';

export const postController = new PostController(
   postService,
   eventPubliser,
   storageService,
   commentServices
);
export const commentController = new CommentController(commentServices, eventPubliser);

export const likeController = new LikeController(eventPubliser);

export const internalController = new InternalController(commentServices, likeServices);

export const hashtagController = new HashtagController(hashtagServices);

export const adminController = new AdminController(postsStat);
