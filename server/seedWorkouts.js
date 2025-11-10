import mongoose from 'mongoose';
import 'dotenv/config';
import { Workout } from '../server/src/models/Workout.js';

const workouts = [
  { id: 'warmup1', name: 'Warm-Up 1', levelRequired: 1, prerequisites: [], order: 1 },
  { id: 'pushups', name: 'Push-Ups', levelRequired: 1, prerequisites: ['warmup1'], order: 2 },
  { id: 'squats', name: 'Squats', levelRequired: 2, prerequisites: ['pushups'], order: 1 },
  { id: 'plank', name: 'Plank', levelRequired: 2, prerequisites: ['pushups'], order: 2 },
  { id: 'burpees', name: 'Burpees', levelRequired: 3, prerequisites: ['squats', 'plank'], order: 1 },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Workout.deleteMany({});
    await Workout.insertMany(workouts);
    console.log(' Seeded workouts with explicit order values');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
})();
