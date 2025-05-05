import { adminAuthController } from '@di/controller/adminController.container';
import express from 'express';

const adminAuthRouter = express.Router();

adminAuthRouter.post('/signup', adminAuthController.signup);
adminAuthRouter.post('/login', adminAuthController.login);
adminAuthRouter.get('/refresh', adminAuthController.refreshAccessToken);
adminAuthRouter.post('/logout', adminAuthController.logout);

export default adminAuthRouter;
