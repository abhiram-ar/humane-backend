import { PostController } from '@presentation/http/controller/Post.controller';
import { postService } from './services.container';

export const postController = new PostController(postService);
