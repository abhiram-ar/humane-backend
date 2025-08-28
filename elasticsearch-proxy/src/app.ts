import express, { Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParse from 'cookie-parser';
import internalQueryRouter from 'routes/internalUserQuery.router';
import publicUserQueryRouter from 'routes/publicUserQuery.router';
import { errorHandler, UnifiedPrometheusMetricsMonitoring } from 'humane-common';
import publicPostRouter from 'routes/pubicPostRouter';
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

app.get('/api/v1/query/health', (req, res) => {
   res.status(200).json({ status: 'OK' });
});

app.post('/api/v1/query/test', async (req, res) => {
   try {
      const rand = Math.random();
      if (rand < 0.01) {
         throw new Error();
      }
      res.status(200).json({ success: true });
   } catch (error) {
      res.status(500).json(error);
   }
});

app.use('/api/v1/query/internal', internalQueryRouter); //TODO" remove query and make this fully iternal

app.use('/api/v1/query/public/user', publicUserQueryRouter);
app.use('/api/v1/query/post', publicPostRouter);

app.use(errorHandler);

export default app;
