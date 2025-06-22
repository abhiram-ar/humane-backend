import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParse from 'cookie-parser';
import { errorHandler } from 'humane-common';
import postRouter from './router/postRouter';
import internalRouter from './router/internalRouter';
import { likeReposotory } from '@di/repository.container';

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

app.get('/api/v1/writer/health', (_, res) => {
   res.status(200).json({ status: 'Ok' });
});

app.use('/api/v1/post', postRouter);

app.use('/api/v1/internal', internalRouter);

app.post('/api/v1/writer/test', async (req, res) => {
   const result = await likeReposotory.bulkDelete([
      { authorId: '5315c3dd-a5bc-4754-9ce7-817018f97f7d', commentId: '684c2f6b50a3a1a43610d910' },
      { authorId: '5315c3dd-a5bc-4754-9ce7-817018f97f7d', commentId: '684c2f6b50a3a1a4361910' },
      { authorId: '5315c3dd-a5bc-4754-9ce7-817018f97f7d', commentId: '684c2f6b50a3a1a4361910' },
      { authorId: '5315c3dd-a5bc-4754-9ce7-817018f97f7d', commentId: '684c2fc050a3a1a43610d916' },
   ]);

   res.status(200).json(result);
});

app.use(errorHandler);

export default app;
