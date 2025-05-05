import express from 'express';
import authRouter from './routes/userAuth.router';
import morgan from 'morgan';
import { errorHandler } from './middlewares/error.middeware';
import cookieParse from 'cookie-parser';
import cors from 'cors';

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

app.get('/', (req, res) => {
   console.log('salt', process.env.passwordSalt);
   res.status(200).send('server live');
});

app.use('/api/v1/user/auth', authRouter);
app.use(errorHandler);
export default app;
