import { humaneScoreController } from '@di/controller.container';
import express from 'express';
import { AuthenticateWithNoError } from 'humane-common';

const router = express.Router();

router.get('/total', AuthenticateWithNoError, humaneScoreController.getUserScore);

export default router;
