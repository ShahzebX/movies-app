import User from "../models/User.js";

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};

export const addFavorite = async (req, res) => {
  const { movie } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (!user.favorites.some((fav) => fav.id === movie.id)) {
    user.favorites.push(movie);
    await user.save();
  }
  res.json(user.favorites);
};

export const removeFavorite = async (req, res) => {
  const { movieId } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.favorites = user.favorites.filter((fav) => fav.id !== movieId);
  await user.save();
  res.json(user.favorites);
};

export const getFavorites = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.favorites);
};

export const addSearchHistory = async (req, res) => {
  const { query } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.searchHistory.unshift(query);
  user.searchHistory = user.searchHistory.slice(0, 20);
  await user.save();
  res.json(user.searchHistory);
};

export const getSearchHistory = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.searchHistory);
};
