import { adminController } from '@di/controller.container';
import express from 'express';

const adminRouter = express.Router();

adminRouter.get('/users-online/count', adminController.getUsersOnline);

export default adminRouter;
