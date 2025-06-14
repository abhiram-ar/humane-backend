import { internalUserQueryController } from '@di/controllers';
import { Router } from 'express';

const internalQueryRouter = Router();

internalQueryRouter.get('/user', internalUserQueryController.searchUser);
internalQueryRouter.get('/post', internalUserQueryController.hydratePostDetails);
export default internalQueryRouter;
