import mongoose from 'mongoose';
import 'dotenv/config';
import { Workout } from './src/models/Workout.js';

const workouts = [
  // ----- LEVEL 1: Warm-Ups -----
  {
    id: 'dynamicstretch',
    name: 'Dynamic Stretch',
    levelRequired: 1,
    order: 1,
    gifUrl: 'https://media.giphy.com/media/fW9xD9Z0wov5e4mGkV/giphy.gif',
    description:
      'Perform dynamic stretches such as leg swings and arm rotations for 30 seconds. Keep your movements controlled and smooth.',
  },
  {
    id: 'armcircles',
    name: 'Arm Circles',
    levelRequired: 1,
    order: 2,
    gifUrl: 'https://media.giphy.com/media/xT9Iglz2rFjXdxrWvu/giphy.gif',
    description:
      'Rotate your arms forward in large circles for 15 seconds, then backward for another 15 seconds.',
  },
  {
    id: 'highknees',
    name: 'High Knees',
    levelRequired: 1,
    order: 3,
    gifUrl: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    description:
      'Run in place bringing knees to waist height. Maintain a steady rhythm and keep your core tight.',
  },

  // ----- LEVEL 2: Push-Ups -----
  {
    id: 'pushups',
    name: 'Push-Ups',
    levelRequired: 2,
    order: 1,
    prerequisites: ['dynamicstretch', 'armcircles', 'highknees'],
    gifUrl: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2Y1OGFwYmRxMDFjbWltbGxqMzJrNzFncjQxM2NuOWxueThpamIwNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/jWlXhoEw9ou8CmrDY7/giphy.gif',
    description:
      'Keep your body in a straight line. Lower yourself until your chest nearly touches the floor, then push back up.',
  },

  // ----- LEVEL 3: Squats + Plank -----
  {
    id: 'squats',
    name: 'Jump Squats',
    levelRequired: 3,
    order: 1,
    prerequisites: ['pushups'],
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-jump-squats-front.mp4',
    description:
      'Stand with feet shoulder-width apart. Keep chest up and knees tracking over toes as you lower down.',
  },
  {
    id: 'plank',
    name: 'Plank',
    levelRequired: 3,
    order: 2,
    prerequisites: ['pushups'],
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-hand-plank-side_GnZ2NZh.mp4',
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
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-Cardio-cardio-jumping-jacks-front.mp4',
    description:
      'Jump feet out and arms overhead simultaneously. Land softly and repeat at a steady rhythm.',
  },
  {
    id: 'situps',
    name: 'Sit-Ups',
    levelRequired: 4,
    order: 2,
    prerequisites: ['squats', 'plank'],
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-situp-side.mp4',
    description:
      'Lie on your back, bend knees, and lift torso to meet thighs. Keep your feet planted and avoid jerking motions.',
  },
  {
    id: 'mountainclimbers',
    name: 'Mountain Climbers',
    levelRequired: 4,
    order: 3,
    prerequisites: ['jumpingjacks', 'situps'],
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-mountain-climber-side.mp4',
    description:
      'From a plank position, alternate driving knees toward your chest quickly, maintaining a flat back.',
  },
  {
    id: 'lunges',
    name: 'Lunges',
    levelRequired: 4,
    order: 4,
    prerequisites: ['jumpingjacks', 'situps'],
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-forward-lunges-side.mp4',
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
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-burpee-front.mp4',
    description:
      'Start standing, drop to a push-up, jump feet back under you, and explode upward. Keep pace steady.',
  },
  {
    id: 'pullups',
    name: 'Pull-Ups',
    levelRequired: 5,
    order: 2,
    prerequisites: ['mountainclimbers', 'lunges'],
    gifUrl: 'https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-pullup-front.mp4',
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
