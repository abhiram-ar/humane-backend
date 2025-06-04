import express from 'express';
import cors from 'cors';
import userNotificationRouter from './router/userNotificationRouter';
import { errorHandler } from 'humane-common';

const app = express();

app.use(
   cors({
      origin: ['http://localhost:5173', 'http://humanedevfe.abhiram-ar.com:5173'],
      credentials: true,
   })
);

app.get('/api/v1/notification/health', (req, res) => {
   res.status(200).json({ health: 'OK' });
});

app.use('/api/v1/notification', userNotificationRouter);

app.use(errorHandler);
export default app;
