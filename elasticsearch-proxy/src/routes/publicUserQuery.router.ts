import { publicUserQueryController } from '@di/controllers';
import { Router } from 'express';

const publicQueryRouter = Router();

publicQueryRouter.get('/', publicUserQueryController.searchUser);
export default publicQueryRouter;
