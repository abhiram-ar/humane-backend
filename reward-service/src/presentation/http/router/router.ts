import { adminController, humaneScoreController } from '@di/controller.container';
import express from 'express';
import { AuthenticateWithNoErrorV2, authorizedRoles, isAuthenticatedV2 } from 'humane-common';

const router = express.Router();

router.get('/total', AuthenticateWithNoErrorV2, humaneScoreController.getUserScore);

router.get(
   '/platform/stats',
   isAuthenticatedV2,
   authorizedRoles('admin'),
   adminController.getPlatfromRewardStats
);

export default router;
