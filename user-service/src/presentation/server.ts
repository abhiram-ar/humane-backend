import express from 'express';
import authRouter from './routes/userAuth.router';
import morgan from 'morgan';
import { errorHandler } from './middlewares/error.middeware';
import cookieParse from 'cookie-parser';
import cors from 'cors';
import adminAuthRouter from './routes/adminAuth.router';
import globalRefreshRouter from './routes/globalRefresh.router';

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

app.use('/api/v1/global/auth/refresh', globalRefreshRouter);
app.use('/api/v1/user/auth', authRouter);
app.use('/api/v1/admin/auth', adminAuthRouter);

app.use(errorHandler);
export default app;
