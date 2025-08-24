import { userProfileController } from '@di/controller/userController.container';
import express from 'express';

const anonProfileRouter = express.Router();

anonProfileRouter.get('/', userProfileController.getProfile);
anonProfileRouter.patch('/', userProfileController.updateProfile);
anonProfileRouter.post('/upload/pre-signed', userProfileController.generatePreSignedURL);
anonProfileRouter.patch('/avatar', userProfileController.updateAvatarPhoto);
anonProfileRouter.patch('/cover-photo', userProfileController.updateCoverPhoto);
anonProfileRouter.patch('/password', userProfileController.changePassword);

export default anonProfileRouter;
