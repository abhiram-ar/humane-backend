import { UserServices } from '@services/User.services';
import { postRepository, userRepository } from './repository';
import { CDNService } from '@services/CDN.services';
import { PostService } from '@services/Post.services';

export const cdnService = new CDNService();
export const userServices = new UserServices(userRepository, cdnService);

export const postServices = new PostService(postRepository);
