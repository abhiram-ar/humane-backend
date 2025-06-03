import express from 'express';

const app = express();

app.get('/api/v1/notification/health', (req, res) => {
   res.status(200).json({ health: 'OK' });
});
export default app;
