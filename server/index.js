import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import meetingRoutes from './routes/meetings.js';

// Resolve __dirname for ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env from the root-level .env (one folder up from server/)
dotenv.config({ path: resolve(__dirname, '../.env') });

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
    console.error('   Make sure MONGO_URI is set in the root .env file');
    process.exit(1);
  });
