import { InternalUserQueryController } from 'controllers/InternalUserQuery.controller';
import { userServices } from './services';

export const internalUserQueryController = new InternalUserQueryController(userServices);
