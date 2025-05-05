import express from 'express';
import { userAuthController } from '@config/DI-container/controller/userController.container';

const authRouter = express.Router();

authRouter.post('/signup', userAuthController.signup);
authRouter.post('/verify', userAuthController.verify);
authRouter.post('/login/email', userAuthController.login);
authRouter.get('/refresh', userAuthController.refreshAccessToken);
authRouter.post('/logout', userAuthController.logout);
authRouter.post('/forgot-password', userAuthController.forgotPassword);
authRouter.patch('/reset-password', userAuthController.resetPassword);

export default authRouter;
