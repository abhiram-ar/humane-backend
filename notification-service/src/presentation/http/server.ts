import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { Kafka } from 'kafkajs';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

const kafka = new Kafka({
   clientId: 'humane-test',
   brokers: ['kafka:9092'],
});

app.get('/api/v1/notification/health', async (req, res) => {
   try {
      const admin = kafka.admin();
      console.log('connecting admin');
      await admin.connect();
      console.log('admin connecte');
      await admin.listTopics();

      res.status(200).json({ status: 'OK' });
   } catch (error) {
      console.log(error);
      res.status(400).json({ message: 'something wrong' });
   }
});

app.post('/api/v1/notification/echo', (req, res) => {
   res.status(200).json({ received: req.body });
});

export default app;
