import express from 'express';
const app = express();

app.use(express.json());

app.get('/api/v1/notification/health', (req, res) => {
   res.status(200).json({ status: 'OK' });
});

app.post('/api/v1/notification/echo', (req, res) => {
   res.status(200).json({ received: req.body });
});

export default app;