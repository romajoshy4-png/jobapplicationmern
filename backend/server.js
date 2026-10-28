import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import applicationRoutes from './src/routes/applications.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API is running', data: { status: 'ok' } });
});
app.use('/api/applications', applicationRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    data: null
  });
});

const port = process.env.PORT || 5000;
try {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing. Create backend/.env from .env.example.');
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
} catch (error) {
  console.error('Could not start backend:', error.message);
  process.exit(1);
}
