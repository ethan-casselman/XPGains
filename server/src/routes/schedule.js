import express from 'express';
import { User } from '../models/User.js';
import { Workout } from '../models/Workout.js';
const router = express.Router();

/**
 * Helper: given ISO YYYY-MM-DD, return array of 7 YYYY-MM-DD strings for the week
 */
function getWeekDates(startISO) {
  const start = new Date(startISO + 'T00:00:00Z');
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

// GET schedule for a given week
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { weekStart } = req.query;
    if (!weekStart) return res.status(400).json({ message: 'weekStart required (YYYY-MM-DD)' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const weekDates = getWeekDates(weekStart);
    const weekItems = user.schedule.filter((s) => weekDates.includes(s.date));

    // Optionally, populate workout details for each scheduled item
    const workoutIds = weekItems.map((w) => w.workoutId);
    const workouts = await Workout.find({ id: { $in: workoutIds } });

    const itemsWithWorkout = weekItems.map((s) => ({
      ...s,
      workout: workouts.find((w) => w.id === s.workoutId) || null,
    }));

    res.json({ weekStart, items: itemsWithWorkout });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST add
router.post('/add', async (req, res) => {
  try {
    const { email, date, workoutId } = req.body;
    if (!email || !date || !workoutId) return res.status(400).json({ message: 'Missing body params' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent duplicates for same date+workout
    const exists = user.schedule.some((s) => s.date === date && s.workoutId === workoutId);
    if (!exists) {
      user.schedule.push({ date, workoutId });
      await user.save();
    }

    res.json({ schedule: user.schedule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST remove
router.post('/remove', async (req, res) => {
  try {
    const { email, date, workoutId } = req.body;
    if (!email || !date || !workoutId) return res.status(400).json({ message: 'Missing body params' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.schedule = user.schedule.filter((s) => !(s.date === date && s.workoutId === workoutId));
    await user.save();

    res.json({ schedule: user.schedule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
