import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';

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

export default expressApp;
