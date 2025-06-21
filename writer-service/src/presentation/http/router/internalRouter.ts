import { internalController } from '@di/controller.container';
import express from 'express';

const internalRouter = express.Router();

internalRouter.get('/comment/metadata', internalController.getCommentMetadataForAUser);

export default internalRouter;
