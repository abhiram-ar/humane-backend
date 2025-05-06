import { adminUserManagementController } from '@di/controller/adminController.container';
import { Router } from 'express';

const adminUserManagementRouter = Router();

adminUserManagementRouter.get('/list', adminUserManagementController.getUsers);

export default adminUserManagementRouter;
