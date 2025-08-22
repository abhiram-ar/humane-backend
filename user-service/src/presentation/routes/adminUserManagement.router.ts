import { adminUserManagementController } from '@di/controller/adminController.container';
import { Router } from 'express';

const adminUserManagementRouter = Router();

adminUserManagementRouter.get('/list', adminUserManagementController.getUsers);
adminUserManagementRouter.patch('/block-status', adminUserManagementController.updateBlockStatus);
adminUserManagementRouter.get('/stats', adminUserManagementController.getUserstats);

export default adminUserManagementRouter;
