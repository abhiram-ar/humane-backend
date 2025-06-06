import { PostService } from '@services/PostServices';
import { commentRepository, postRepoitory } from './repository.container';
import { CommentService } from '@services/CommentServices';

export const postService = new PostService(postRepoitory);
export const commentServices = new CommentService(commentRepository, postRepoitory);
