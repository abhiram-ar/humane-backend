import { InternalUserQueryController } from 'controllers/PublicUserQuery.controller';
import { userServices } from './services';

export const publicUserQueryController = new InternalUserQueryController(userServices);
