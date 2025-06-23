import { UserServices } from '@services/User.services';
import { commentRepository, postRepository, userRepository } from './repository';
import { CDNService } from '@services/CDN.services';
import { PostService } from '@services/Post.services';
import { CommentService } from '@services/Comment.services';
import { ExternalUserServices } from '@services/external/ExternalUserServices';
import { ExternalWriterService } from '@services/external/WriterService';

export const cdnService = new CDNService();
export const userServices = new UserServices(userRepository, cdnService);

export const postServices = new PostService(postRepository, cdnService);

export const commentServices = new CommentService(commentRepository);

export const externalUserServices = new ExternalUserServices();

export const externalWriterService = new ExternalWriterService();
