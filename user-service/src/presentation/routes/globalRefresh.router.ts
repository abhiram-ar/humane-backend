import { globalRefreshController } from '@di/controller/globalControllers.container';
import express from 'express';

const globalRefreshRouter = express.Router();

globalRefreshRouter.get('/', globalRefreshController.refresh);

export default globalRefreshRouter
