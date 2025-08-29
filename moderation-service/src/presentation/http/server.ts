import express, { Request, Response } from 'express';
import morgan from 'morgan';
import { errorHandler, UnifiedPrometheusMetricsMonitoring } from 'humane-common';
import * as promClient from 'prom-client';

const app = express();

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });
const monitoring = new UnifiedPrometheusMetricsMonitoring(promClient);

register.registerMetric(monitoring.httpRequestTotal);
register.registerMetric(monitoring.httpRequestDuration);

app.use(monitoring.metricsMiddleware);
app.use(express.json());
app.use(morgan('dev'));

app.get('/metrics', async (_req: Request, res: Response) => {
   res.set('Content-Type', register.contentType);
   res.end(await register.metrics());
});

app.use(errorHandler);
export default app;
