import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema(
  {
  id: { type: String, required: true, unique: true },   // e.g., 'pushups'
  name: { type: String, required: true },               // Human-readable
  levelRequired: { type: Number, required: true },      // 1–5
  order: { type: Number, required: true },              // Controls display order
  prerequisites: { type: [String], default: [] },       // IDs required before unlocking
  gifUrl: { type: String, default: '' },                // NEW → animation link
  description: { type: String, default: '' },           // NEW → instructions/tips
  },
  { timestamps: true }
);

export const Workout = mongoose.model('Workout', workoutSchema);
