import mongoose from "mongoose";
import dotenv from "dotenv";
import { Workout } from "./src/models/Workout.js";

dotenv.config();
await mongoose.connect(process.env.MONGODB_URI);

const workouts = [
  // Level 1 – Intro Phase
  { id: "dynamicstretch", name: "Dynamic Stretch", levelRequired: 1, prerequisites: [] },
  { id: "armcircles", name: "Arm Circles", levelRequired: 1, prerequisites: [] },
  { id: "highknees", name: "High Knees", levelRequired: 1, prerequisites: [] },

  // Level 2 – Strength Foundation
  { id: "pushups", name: "Push-Ups", levelRequired: 2, prerequisites: ["dynamicstretch", "armcircles", "highknees"] },

  // Level 3 – Core & Legs
  { id: "squats", name: "Squats", levelRequired: 3, prerequisites: ["pushups"] },
  { id: "planks", name: "Planks", levelRequired: 3, prerequisites: ["pushups"] },

  // Level 4 – Conditioning
  { id: "lunges", name: "Lunges", levelRequired: 4, prerequisites: ["squats"] },
  { id: "jumpingjacks", name: "Jumping Jacks", levelRequired: 4, prerequisites: ["squats"] },
  { id: "situps", name: "Sit-Ups", levelRequired: 4, prerequisites: ["planks"] },
  { id: "mountainclimbers", name: "Mountain Climbers", levelRequired: 4, prerequisites: ["planks"] },

  // Level 5 – Challenge
  { id: "burpees", name: "Burpees", levelRequired: 5, prerequisites: ["lunges", "jumpingjacks"] },
  { id: "pullups", name: "Pull-Ups", levelRequired: 5, prerequisites: ["situps", "mountainclimbers"] },
];

await Workout.deleteMany({});
await Workout.insertMany(workouts);

console.log("✅ Seeded workouts successfully!");
mongoose.connection.close();
