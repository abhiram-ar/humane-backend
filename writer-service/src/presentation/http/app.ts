import express, { Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParse from 'cookie-parser';
import {
   authorizedRoles,
   errorHandler,
   isAuthenticatedV2,
   UnifiedPrometheusMetricsMonitoring,
} from 'humane-common';
import postRouter from './router/postRouter';
import internalRouter from './router/internalRouter';
import hashtagRouter from './router/hashtagRouter';
import adminRouter from './router/adminRouter';
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

app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParse());

app.get('/metrics', async (_req, res: Response) => {
   res.set('Content-Type', register.contentType);
   res.end(await register.metrics());
});

app.get('/api/v1/writer/health', (_, res) => {
   res.status(200).json({ status: 'Ok' });
});

app.use('/api/v1/post', postRouter);
app.use('/api/v1/writer/hashtag', hashtagRouter);
app.use('/api/v1/writer/admin', isAuthenticatedV2, authorizedRoles('admin'), adminRouter);

app.use('/api/v1/internal', internalRouter);

app.use(errorHandler);

export default app;
