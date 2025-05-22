import { internalUserQueryController } from '@di/controllers';
import { Router } from 'express';

const internalQueryRouter = Router();

internalQueryRouter.get('/user', internalUserQueryController.searchUser);
export default internalQueryRouter;
