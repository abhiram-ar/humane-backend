import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParse from 'cookie-parser';
import internalQueryRouter from 'routes/internalUserQuery.router';
import publicQueryRouter from 'routes/publicUserQuery.router';
import { errorHandler } from 'humane-common';
import publicPostRouter from 'routes/pubicPostRouter';
import { userRepository } from '@di/repository';

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

app.get('/api/v1/query/health', (req, res) => {
   res.status(200).json({ status: 'OK' });
});

app.post('/api/v1/query/test', (req, res) => {
   try {
      const result = userRepository.bulkUpdateHumaneScoreFromDiff(req.body);
      res.status(200).json(result);
   } catch (error) {
      res.status(500).json(error);
   }
});

app.use('/api/v1/query/internal', internalQueryRouter); //TODO" remove query and make this fully iternal

app.use('/api/v1/query/public', publicQueryRouter);
app.use('/api/v1/query/post', publicPostRouter);

app.use(errorHandler);

export default app;
