import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from 'humane-common';
import chatRouter from './router/chat.router';

const expressApp = express();

expressApp.use('/api/v1/chat/socket.io', (req: Request, res: Response, next: NextFunction) => {
   res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
   res.setHeader('Pragma', 'no-cache');
   res.setHeader('Expires', '0');
   next();
});

expressApp.use(cors());
expressApp.use(morgan('dev'));

expressApp.get('/api/v1/chat/health', (req, res) => {
   res.status(200).json({ status: 'ok' });
});

expressApp.use('/api/v1/chat', chatRouter);
expressApp.use(errorHandler);

export default expressApp;
