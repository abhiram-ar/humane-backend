import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParse from 'cookie-parser';
import { errorHandler } from 'humane-common';
import timelineRouter from './router/timeline.rotuer';

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

app.get('/api/v1/feed/health', (req, res) => {
   res.status(200).json({ status: 'OK', srv: 'feed' });
});

app.use('/api/v1/feed/', timelineRouter);

app.use(errorHandler);

export default app;
