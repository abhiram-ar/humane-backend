import express, { Request, Response } from 'express';
import authRouter from './routes/userAuth.router';
import morgan from 'morgan';
import { errorHandler } from './middlewares/error.middeware';
import cookieParse from 'cookie-parser';
import cors from 'cors';
import adminAuthRouter from './routes/adminAuth.router';
import globalRefreshRouter from './routes/globalRefresh.router';
import adminUserManagementRouter from './routes/adminUserManagement.router';
import userProfileRouter from './routes/userProfile.router';
import { seedUser } from 'test/seedController';
import userRelationshipRouter from './routes/userRelationship.router';
import { sendBulkFriendReq } from 'test/sendBulkFriendReq';
import internalRouter from './routes/internal.router';
import {
   authorizedRoles,
   isAuthenticatedV2,
   UnifiedPrometheusMetricsMonitoring,
} from 'humane-common';
import * as promClient from 'prom-client';

const app = express();

app.use(
   cors({
      origin: ['http://localhost:5173', 'https://humane.abhiram-ar.com'],
      credentials: true,
   })
);

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });
const monitoring = new UnifiedPrometheusMetricsMonitoring(promClient);

register.registerMetric(monitoring.httpRequestTotal);
register.registerMetric(monitoring.httpRequestDuration);

app.use(monitoring.metricsMiddleware);
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParse());

app.get('/metrics', async (_req: Request, res: Response) => {
   res.set('Content-Type', register.contentType);
   res.end(await register.metrics());
});

app.use('/api/v1/internal', internalRouter);

app.post('/api/v1/user/seed', seedUser);
app.post('/api/v1/user/test/send-friend-req', sendBulkFriendReq);

app.use('/api/v1/global/auth/refresh', globalRefreshRouter);
app.use('/api/v1/user/auth', authRouter);
app.use('/api/v1/admin/auth', adminAuthRouter);

app.use('/api/v1/user/social', userRelationshipRouter);

app.use('/api/v1/user/profile', isAuthenticatedV2, authorizedRoles('user'), userProfileRouter);

app.use(
   '/api/v1/admin/manage/user',
   isAuthenticatedV2,
   authorizedRoles('admin'),
   adminUserManagementRouter
);

app.use(errorHandler);
export default app;
