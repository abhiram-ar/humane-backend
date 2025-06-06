import { PostService } from '@services/PostServices';
import { postRepoitory } from './repository.container';

export const postService = new PostService(postRepoitory);
