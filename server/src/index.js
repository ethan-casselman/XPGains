import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import { User } from './models/User.js';
import progressRoutes from './routes/progress.js';
import scheduleRoutes from './routes/schedule.js';  // <-- NEW

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/progress', progressRoutes);
app.use('/api/schedule', scheduleRoutes);   // <-- NEW

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// Register
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already in use' });

  const user = await User.create({ email, password });
  return res.status(201).json({ user: { id: user._id, email: user.email } });
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  const user = await User.findOne({ email });
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  return res.json({ user: { id: user._id, email: user.email } });
});

// Start server
const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Mongo connection error:', err);
    process.exit(1);
  });
