import express, { Response } from 'express';
import cors from 'cors';
import userNotificationRouter from './router/userNotificationRouter';
import {
   authorizedRoles,
   errorHandler,
   isAuthenticatedV2,
   UnifiedPrometheusMetricsMonitoring,
} from 'humane-common';
import morgan from 'morgan';
import cookieParse from 'cookie-parser';
import adminRouter from './router/adminRouter';
import * as promClient from 'prom-client';

const app = express();

app.use(
   cors({
      origin: ['http://localhost:5173', 'http://humanedevfe.abhiram-ar.com:5173'],
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

app.get('/metrics', async (_req, res: Response) => {
   res.set('Content-Type', register.contentType);
   res.end(await register.metrics());
});

app.get('/api/v1/notification/health', (req, res) => {
   res.status(200).json({ health: 'OK' });
});

app.use('/api/v1/notification/admin', isAuthenticatedV2, authorizedRoles('admin'), adminRouter);

app.use('/api/v1/notification', userNotificationRouter);

app.use(errorHandler);
export default app;
