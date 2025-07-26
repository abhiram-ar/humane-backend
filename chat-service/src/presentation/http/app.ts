import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from 'humane-common';
import chatRouter from './router/chat.router';
import { conversationRepository } from '@di/repository.container';

const expressApp = express();

expressApp.use('/api/v1/chat/socket.io', (req: Request, res: Response, next: NextFunction) => {
   res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
   res.setHeader('Pragma', 'no-cache');
   res.setHeader('Expires', '0');
   next();
});

expressApp.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
expressApp.use(morgan('dev'));

expressApp.get('/api/v1/chat/health', (req, res) => {
   res.status(200).json({ status: 'ok' });
});

expressApp.get('/api/v1/chat/test', async (req, res, next) => {
   try {
      const result = await conversationRepository.findManyUserOneToOneConvoByParticipantIds(
         '5315c3dd-a5bc-4754-9ce7-817018f97f7d',
         ['4208d67b-1af8-488b-97e7-a719d632af33'],
         10
      );
      res.status(200).json(result);
   } catch (error) {
      next(error);
   }
});

expressApp.use('/api/v1/chat', chatRouter);
expressApp.use(errorHandler);

export default expressApp;
