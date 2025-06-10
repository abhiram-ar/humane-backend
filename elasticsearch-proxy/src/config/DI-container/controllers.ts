import { InternalUserQueryController } from 'controllers/InternalUserQuery.controller';
import { postServices, userServices } from './services';
import { PublicUserQueryController } from 'controllers/PublicUserQuery.controller';

export const internalUserQueryController = new InternalUserQueryController(
   userServices,
   postServices
);
export const publicUserQueryController = new PublicUserQueryController(userServices);
