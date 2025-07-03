import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParse from 'cookie-parser';
import { errorHandler } from 'humane-common';
import postRouter from './router/postRouter';
import internalRouter from './router/internalRouter';
import hashtagRouter from './router/hashtagRouter';
import { commentServices } from '@di/services.container';

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
app.use('/api/v1/writer/hashtag', hashtagRouter);

app.use('/api/v1/internal', internalRouter);

app.post('/api/v1/writer/test', async (req, res) => {
   const result = commentServices.setCommentLikedByPostAuthor({
      commentId: '68661c5428585c0bc1e4210d',
      authorId: '4208d67b-1af8-488b-97e7-a719d632af33',
   });

   res.status(200).json(result);
});

app.use(errorHandler);

export default app;
