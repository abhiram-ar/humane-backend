import { InternalUserQueryController } from 'controllers/InternalUserQuery.controller';
import { userServices } from './services';
import { PublicUserQueryController } from 'controllers/PublicUserQuery.controller';

export const internalUserQueryController = new InternalUserQueryController(userServices);
export const publicUserQueryController = new PublicUserQueryController(userServices);
