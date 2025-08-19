import { humaneScoreController } from '@di/controller.container';
import express from 'express';
import { AuthenticateWithNoErrorV2 } from 'humane-common';

const router = express.Router();

router.get('/total', AuthenticateWithNoErrorV2, humaneScoreController.getUserScore);

export default router;
