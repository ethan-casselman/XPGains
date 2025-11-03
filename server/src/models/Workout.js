import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    levelRequired: { type: Number, default: 1 },
    prerequisites: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Workout = mongoose.model('Workout', workoutSchema);
