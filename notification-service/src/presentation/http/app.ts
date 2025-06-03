import express from 'express';
import cors from 'cors';

const app = express();

app.use(
   cors({
      origin: ['http://localhost:5173', 'http://humanedevfe.abhiram-ar.com:5173'],
      credentials: true,
   })
);

app.get('/api/v1/notification/health', (req, res) => {
   res.status(200).json({ health: 'OK' });
});
export default app;
