import express from 'express';
import { User } from '../models/User.js';
import { Workout } from '../models/Workout.js';

const router = express.Router();

// Get user's progress
router.get('/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      level: user.level,
      completedWorkouts: user.completedWorkouts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all workouts (for the tree)
router.get('/tree/all', async (_req, res) => {
  try {
    const workouts = await Workout.find().sort({levelRequired: 1, order: 1});
    res.json(workouts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/complete', async (req, res) => {
  const { email, workoutId } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.completedWorkouts.includes(workoutId)) {
      user.completedWorkouts.push(workoutId);
      // How levels are handled
      user.level = Math.floor(user.completedWorkouts.length / 2) + 1;
      await user.save();
    }

    res.json({
      level: user.level,
      completedWorkouts: user.completedWorkouts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
