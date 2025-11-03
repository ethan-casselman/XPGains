import 'dotenv/config';     // Loads environment variables from a .env file into process.env so we can use MONGODB_URI and PORT.
import express from 'express';  // Pulls in the Express web framework to build our HTTP API.
import mongoose from 'mongoose';    // Mongoose is an ODM that lets us talk to MongoDB using models and schemas.
import cors from 'cors';    // CORS middleware so our Expo app (running on a different origin) can call this API in dev.
import { User } from './models/User.js';    // Our Mongoose User model (email + password) stored in MongoDB.
import progressRoutes from './routes/progress.js';

const app = express();  // Creates the Express application (the server instance).
app.use(cors());    // Enables Cross-Origin Resource Sharing for all routes (fine for local learning).
app.use(express.json());    // Lets Express automatically parse JSON request bodies into req.body.
app.use('/api/progress', progressRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));  // A tiny endpoint you can hit to verify the API is running.

// Register
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body || {};
  // Pulls email and password out of the JSON body.
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  // Basic validation: require both fields.

  const exists = await User.findOne({ email });
  // Look up an existing user with the same email.
  if (exists) return res.status(409).json({ message: 'Email already in use' });
  // If found, respond with 409 Conflict.

  const user = await User.create({ email, password });
  // Create a new user document in MongoDB (plain-text password in this learning version).
  return res.status(201).json({ user: { id: user._id, email: user.email } });
  // Return a simple JSON payload with the newly created user id and email.
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  // Read login credentials from the request body.
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  // Ensure both were provided.

  const user = await User.findOne({ email });
  // Find the user by email in the database.
  if (!user || user.password !== password) {
    // If no user or password mismatch, deny login.
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  return res.json({ user: { id: user._id, email: user.email } });
  // On success, return the user details (no tokens in this minimal example).
});

// Start
const PORT = process.env.PORT || 4000;
// Use PORT from env if set, otherwise default to 4000.

mongoose
  .connect(process.env.MONGODB_URI)
  // Connect to MongoDB using the connection string from Atlas.
  .then(() => app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`)))
  // Once connected, start the Express server and log the URL.
  .catch((err) => {
    console.error('Mongo connection error:', err);
    // If MongoDB connection fails, log the error and exit.
    process.exit(1);
  });

// -----------------------------
// How to expand this backend next
// -----------------------------
// 1) Add password hashing (bcrypt) to avoid storing plain-text passwords.
// 2) Issue JWTs on login and build an auth middleware to protect routes.
// 3) Split routes/controllers into separate files for larger apps.
// 4) Add input validation (zod or express-validator) and centralized error handling.
// 5) Configure environment-specific settings (dev/staging/prod) and logging.