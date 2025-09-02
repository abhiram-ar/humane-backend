import express, { Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParse from 'cookie-parser';
import router from './router/router';
import { errorHandler, UnifiedPrometheusMetricsMonitoring } from 'humane-common';
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

app.get('/metrics', async (_req, res: Response) => {
   res.set('Content-Type', register.contentType);
   res.end(await register.metrics());
});

app.get('/api/v1/reward/health', (req, res) => {
   res.status(200).json({ status: 'OK', headers: req.headers });
});

app.use('/api/v1/reward', router);

app.use(errorHandler);

export default app;
