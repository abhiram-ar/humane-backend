import { UserServices } from '@services/User.services';
import { commentRepository, postRepository, userRepository } from './repository';
import { CDNService } from '@services/CDN.services';
import { PostService } from '@services/Post.services';
import { CommentService } from '@services/Comment.services';

export const cdnService = new CDNService();
export const userServices = new UserServices(userRepository, cdnService);

export const postServices = new PostService(postRepository);

export const commentServices = new CommentService(commentRepository);
