import { anonProfileController } from '@di/controller/anonController.container';
import express from 'express';

const anonProfileRouter = express.Router();

anonProfileRouter.get('/', anonProfileController.getProfile);
anonProfileRouter.patch('/', anonProfileController.updateProfile);
anonProfileRouter.post('/upload/pre-signed', anonProfileController.generatePreSignedURL);
anonProfileRouter.patch('/avatar', anonProfileController.updateAvatarPhoto);
anonProfileRouter.patch('/cover-photo', anonProfileController.updateCoverPhoto);

export default anonProfileRouter;
