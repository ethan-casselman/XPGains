import mongoose from 'mongoose';
// Pull in Mongoose to define a schema and model for our users collection.

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true, trim: true, lowercase: true },
    // The user's email. We enforce uniqueness and some basic formatting helpers.
    password: { type: String, required: true } // plain text for learning only
    // The user's password (stored in plain text in this learning version).
  },
  { timestamps: true }
);
// The second argument adds createdAt/updatedAt timestamps automatically.

export const User = mongoose.model('User', userSchema);
// Create and export the User model so other files (like index.js) can use it.

// -----------------------------
// How to expand this model next
// -----------------------------
// 1) Hash the password before save (bcrypt) and add a comparePassword method.
// 2) Add fields like displayName, avatarUrl, or roles/permissions.
// 3) Add indexes for frequent queries (e.g., email). 
// 4) Create validation logic or use Mongoose validators for stronger constraints.