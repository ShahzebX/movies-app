import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true, unique: true },
  type: { type: String, enum: ["movie", "tv"], required: true },
  data: { type: Object, required: true },
});

export default mongoose.model("Movie", movieSchema);
