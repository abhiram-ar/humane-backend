import { adminController } from '@di/controller.container';
import express from 'express';
const adminRouter = express.Router();

adminRouter.get('/stats', adminController.getPostStats);

export default adminRouter;
