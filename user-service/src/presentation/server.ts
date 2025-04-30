import express from 'express';
import authRouter from './routes/userAuth.router';
import morgan from 'morgan';

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
   console.log('salt', process.env.passwordSalt);
   res.status(200).send('server live');
});

app.use('/api/v1/user/auth', authRouter);

export default app;
