import { publicUserQueryController } from '@di/controllers';
import { Router } from 'express';

const publicUserQueryRouter = Router();

publicUserQueryRouter.get('/', publicUserQueryController.searchUser);
publicUserQueryRouter.get('/basic', publicUserQueryController.getUserBasicDetailsFromIds);
publicUserQueryRouter.get('/:userId', publicUserQueryController.getUserProfile);
publicUserQueryRouter.get('/:userId/humaneScore', publicUserQueryController.getHumaneScore);

export default publicUserQueryRouter;
