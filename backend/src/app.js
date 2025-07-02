import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import config from "./config.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";

console.log("Config loaded:", config);
console.log("MongoDB URI:", config.mongoUri);
console.log("Port:", config.port);

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => res.send("Movies API running"));

mongoose
  .connect(config.mongoUri)
  .then(() => {
    app.listen(config.port, () =>
      console.log(`Server running on port ${config.port}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
