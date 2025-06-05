import { publicUserQueryController } from '@di/controllers';
import { Router } from 'express';

const publicQueryRouter = Router();

publicQueryRouter.get('/user', publicUserQueryController.searchUser);
publicQueryRouter.get('/user/basic', publicUserQueryController.getUserBasicDetailsFromIds);
publicQueryRouter.get('/user/:userId', publicUserQueryController.getUserProfile);

export default publicQueryRouter;
