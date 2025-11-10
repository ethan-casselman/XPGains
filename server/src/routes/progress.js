import express from "express";
import { User } from "../models/User.js";
import { Workout } from "../models/Workout.js";

const router = express.Router();

// Get user's progress
router.get("/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      level: user.level,
      completedWorkouts: user.completedWorkouts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all workouts (for the tree)
router.get("/tree/all", async (_req, res) => {
  try {
    const workouts = await Workout.find().sort({ levelRequired: 1, order: 1 });
    res.json(workouts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Complete a workout and update progress
router.post("/complete", async (req, res) => {
  const { email, workoutId } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const workout = await Workout.findOne({ id: workoutId });
    if (!workout) return res.status(404).json({ message: "Workout not found" });

    // Add workout if not already completed
    if (!user.completedWorkouts.includes(workoutId)) {
      user.completedWorkouts.push(workoutId);
    }

    // Fetch all workouts
    const allWorkouts = await Workout.find();

    // Determine new level
    let newLevel = 1;
    for (let level = 1; level <= 5; level++) {
      const workoutsAtLevel = allWorkouts.filter(
        (w) => w.levelRequired === level
      );
      const allCompleted = workoutsAtLevel.every((w) =>
        user.completedWorkouts.includes(w.id)
      );

      if (allCompleted) {
        newLevel = level + 1; // Unlock next level when current fully completed
      } else {
        break; // Stop if this level isn’t fully done
      }
    }

    // Cap at level 5
    user.level = Math.min(newLevel, 5);
    await user.save();

    res.json({
      level: user.level,
      completedWorkouts: user.completedWorkouts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
