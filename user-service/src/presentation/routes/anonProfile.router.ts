import { anonProfileController } from '@di/controller/anonController.container';
import express from 'express';

const anonProfileRouter = express.Router();

anonProfileRouter.get('/', anonProfileController.getProfile);

export default anonProfileRouter;
