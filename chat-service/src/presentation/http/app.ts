import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from 'humane-common';
import chatRouter from './router/chat.router';
import {  messageRepository } from '@di/repository.container';

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
      const result = await messageRepository.getOneToOneMessages(
         '686e362ea6c7d7c57a3038df',
         null,
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
