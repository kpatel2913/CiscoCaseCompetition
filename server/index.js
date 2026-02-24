import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import meetingRoutes from './routes/meetings.js';

// Load .env first, then .env.local (local overrides win)
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const app = express();


app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/meetings', meetingRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on :${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('   Make sure MONGO_URI is set in server/.env');
    process.exit(1);
  });
