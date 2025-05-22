import { publicUserQueryController } from '@di/controllers';
import { Router } from 'express';

const userQueryRouter = Router();

userQueryRouter.get('/', publicUserQueryController.searchUser);
export default userQueryRouter