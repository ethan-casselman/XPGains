import mongoose from 'mongoose';

const scheduledItemSchema = new mongoose.Schema({
  date: { type: String, required: true }, 
  workoutId: { type: String, required: true },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    level: { type: Number, default: 1 },
    completedWorkouts: { type: [String], default: [] },
    schedule: { type: [scheduledItemSchema], default: [] },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
