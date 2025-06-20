import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParse from 'cookie-parser';
import { errorHandler } from 'humane-common';
import postRouter from './router/postRouter';
import { likeServices } from '@di/services.container';

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

app.post('/api/v1/writer/test', async (req, res) => {
   const result = await likeServices.bulkInsert([
      { commentId: '684c2cf950a3a1a43610d90d', authorId: 'gopalan' },
   ]);
   res.status(200).json(result);
});

app.get('/api/v1/writer/health', (_, res) => {
   res.status(200).json({ status: 'Ok' });
});

app.use('/api/v1/post', postRouter);

app.use(errorHandler);

export default app;
