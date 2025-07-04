import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: [{ type: Object }], // Store movie objects or just IDs
  searchHistory: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
