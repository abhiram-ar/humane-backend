import express, { Response } from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import * as promClient from 'prom-client';
import { UnifiedPrometheusMetricsMonitoring } from 'humane-common';

const app = express();

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });
const monitoring = new UnifiedPrometheusMetricsMonitoring(promClient);
register.registerMetric(monitoring.httpRequestTotal);
register.registerMetric(monitoring.httpRequestDuration);

app.use(monitoring.metricsMiddleware);
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

app.get('/metrics', async (_req, res: Response) => {
   res.set('Content-Type', register.contentType);
   res.end(await register.metrics());
});

export default app;
