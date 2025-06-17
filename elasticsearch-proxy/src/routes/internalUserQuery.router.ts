import { internalQueryController } from '@di/controllers';
import { Router } from 'express';

const internalQueryRouter = Router();

internalQueryRouter.get('/user', internalQueryController.searchUser);
internalQueryRouter.get('/post', internalQueryController.hydratePostDetails);
export default internalQueryRouter;
