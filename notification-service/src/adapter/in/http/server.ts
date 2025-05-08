import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

app.get('/api/v1/notification/health', (req, res) => {
   console.log('hello from nofi');
   res.status(200).json({ status: 'OK' });
});

app.post('/api/v1/notification/echo', (req, res) => {
   res.status(200).json({ received: req.body });
});

export default app;
