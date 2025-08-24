import express from 'express';
import cors from 'cors';
import userNotificationRouter from './router/userNotificationRouter';
import { authorizedRoles, errorHandler, isAuthenticatedV2 } from 'humane-common';
import morgan from 'morgan';
import cookieParse from 'cookie-parser';
import adminRouter from './router/adminRouter';

const app = express();

app.use(
   cors({
      origin: ['http://localhost:5173', 'http://humanedevfe.abhiram-ar.com:5173'],
      credentials: true,
   })
);
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParse());

app.get('/api/v1/notification/health', (req, res) => {
   res.status(200).json({ health: 'OK' });
});

app.use('/api/v1/notification/admin', isAuthenticatedV2, authorizedRoles('admin'), adminRouter);

app.use('/api/v1/notification', userNotificationRouter);

app.use(errorHandler);
export default app;
