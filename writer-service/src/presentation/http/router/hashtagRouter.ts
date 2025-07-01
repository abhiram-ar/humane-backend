import { hashtagController } from '@di/controller.container';
import express from 'express';

const hashtagRouter = express.Router();

hashtagRouter.get('/', hashtagController.prefixSearch);

export default hashtagRouter;
