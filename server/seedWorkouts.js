import mongoose from 'mongoose';
import 'dotenv/config';
import { Workout } from './src/models/Workout.js';

const workouts = [
  // ----- LEVEL 1: Warm-Ups -----
  {
    id: 'torsotwists',
    name: 'Torso Twists',
    levelRequired: 1,
    order: 1,
    description:
      'Stand with your feet shoulder-width apart and rotate your torso left and right at a steady pace, keeping your core engaged and arms up, repeating controlled twists.',
  },
  {
    id: 'armcircles',
    name: 'Arm Circles',
    levelRequired: 1,
    order: 2,
    description:
      'Rotate your arms forward in large circles for 15 seconds, then backward for another 15 seconds.',
  },
  {
    id: 'highknees',
    name: 'High Knees',
    levelRequired: 1,
    order: 3,
    description:
      'Run in place bringing knees to waist height. Maintain a steady rhythm and keep your core tight.',
  },

  // ----- LEVEL 2: Push-Ups -----
  {
    id: 'pushups',
    name: 'Push-Ups',
    levelRequired: 2,
    order: 1,
    prerequisites: ['torsotwists', 'armcircles', 'highknees'],
    description:
      'Keep your body in a straight line. Lower yourself until your chest nearly touches the floor, then push back up.',
  },

  // ----- LEVEL 3: Squats + Plank -----
  {
    id: 'squats',
    name: 'Squats',
    levelRequired: 3,
    order: 1,
    prerequisites: ['pushups'],
    description:
      'Stand with feet shoulder-width apart. Keep chest up and knees tracking over toes as you lower down.',
  },
  {
    id: 'plank',
    name: 'Plank',
    levelRequired: 3,
    order: 2,
    prerequisites: ['pushups'],
    description:
      'Hold your body in a straight line on forearms and toes. Engage your core—avoid sagging hips.',
  },

  // ----- LEVEL 4: Conditioning -----
  {
    id: 'jumpingjacks',
    name: 'Jumping Jacks',
    levelRequired: 4,
    order: 1,
    prerequisites: ['squats', 'plank'],
    description:
      'Jump feet out and arms overhead simultaneously. Land softly and repeat at a steady rhythm.',
  },
  {
    id: 'situps',
    name: 'Sit-Ups',
    levelRequired: 4,
    order: 2,
    prerequisites: ['squats', 'plank'],
    description:
      'Lie on your back, bend knees, and lift torso to meet thighs. Keep your feet planted and avoid jerking motions.',
  },
  {
    id: 'mountainclimbers',
    name: 'Mountain Climbers',
    levelRequired: 4,
    order: 3,
    prerequisites: ['jumpingjacks', 'situps'],
    description:
      'From a plank position, alternate driving knees toward your chest quickly, maintaining a flat back.',
  },
  {
    id: 'lunges',
    name: 'Lunges',
    levelRequired: 4,
    order: 4,
    prerequisites: ['jumpingjacks', 'situps'],
    description:
      'Step forward with one leg, lowering hips until both knees are bent at 90°. Push back up and alternate legs.',
  },

  // ----- LEVEL 5: Challenge -----
  {
    id: 'burpees',
    name: 'Burpees',
    levelRequired: 5,
    order: 1,
    prerequisites: ['mountainclimbers', 'lunges'],
    description:
      'Start standing, drop to a push-up, jump feet back under you, and explode upward. Keep pace steady.',
  },
  {
    id: 'pullups',
    name: 'Pull-Ups',
    levelRequired: 5,
    order: 2,
    prerequisites: ['mountainclimbers', 'lunges'],
    description:
      'Grip the bar shoulder-width apart, pull your chin above the bar, then lower slowly under control.',
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Workout.deleteMany({});
  await Workout.insertMany(workouts);
  console.log('✅ Workouts seeded successfully.');
  mongoose.disconnect();
}

seed();
