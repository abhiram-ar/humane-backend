import { UserServices } from '@services/User.services';
import { userRepository } from './repository';
import { CDNService } from '@services/CDN.services';

export const cdnService = new CDNService();
export const userServices = new UserServices(userRepository, cdnService);
