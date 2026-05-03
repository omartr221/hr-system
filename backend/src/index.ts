import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDb } from './db/database';
import authRoutes from './routes/auth';
import jobsRoutes from './routes/jobs';
import applicationsRoutes from './routes/applications';
import dashboardRoutes from './routes/dashboard';
import { startBackgroundWorker } from './services/backgroundWorker';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

initDb()
  .then(async () => {
    await startBackgroundWorker();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
