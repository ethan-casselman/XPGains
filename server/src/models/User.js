import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true, trim: true, lowercase: true },

    password: { type: String, required: true },

    level: { type: Number, default: 1 },

    completedWorkouts: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Create and export the User model
export const User = mongoose.model('User', userSchema);


// -----------------------------
// How to expand this model next
// -----------------------------
// 1) Hash the password before save (bcrypt) and add a comparePassword method.
// 2) Add fields like displayName, avatarUrl, or roles/permissions.
// 3) Add indexes for frequent queries (e.g., email). 
// 4) Create validation logic or use Mongoose validators for stronger constraints.