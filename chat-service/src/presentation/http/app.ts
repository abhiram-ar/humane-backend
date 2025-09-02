import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler, UnifiedPrometheusMetricsMonitoring } from 'humane-common';
import chatRouter from './router/chat.router';
import * as promClient from 'prom-client';

const expressApp = express();

expressApp.use('/api/v1/chat/socket.io', (req: Request, res: Response, next: NextFunction) => {
   res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
   res.setHeader('Pragma', 'no-cache');
   res.setHeader('Expires', '0');
   next();
});

expressApp.use(
   cors({ origin: ['http://localhost:5173', 'https://humane.abhiram-ar.com'], credentials: true })
);

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });
const monitoring = new UnifiedPrometheusMetricsMonitoring(promClient);
register.registerMetric(monitoring.httpRequestTotal);
register.registerMetric(monitoring.httpRequestDuration);

expressApp.use(monitoring.metricsMiddleware);
expressApp.use(morgan('dev'));

expressApp.get('/metrics', async (_req: Request, res: Response) => {
   res.set('Content-Type', register.contentType);
   res.end(await register.metrics());
});

expressApp.get('/api/v1/chat/health', (req, res) => {
   res.status(200).json({ status: 'ok' });
});

expressApp.get('/api/v1/chat/test', async (req, res, next) => {
   try {
      res.status(200).json(true);
   } catch (error) {
      next(error);
   }
});

expressApp.use('/api/v1/chat', chatRouter);
expressApp.use(errorHandler);

export default expressApp;
