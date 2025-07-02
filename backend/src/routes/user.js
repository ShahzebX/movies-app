import express from "express";
import auth from "../middleware/auth.js";
import {
  getProfile,
  addFavorite,
  removeFavorite,
  getFavorites,
  addSearchHistory,
  getSearchHistory,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", auth, getProfile);
router.post("/favorites", auth, addFavorite);
router.delete("/favorites", auth, removeFavorite);
router.get("/favorites", auth, getFavorites);
router.post("/search-history", auth, addSearchHistory);
router.get("/search-history", auth, getSearchHistory);

export default router;
