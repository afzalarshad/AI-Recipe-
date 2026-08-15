import "dotenv/config";
import cors from "cors";
import express from "express";
import { mealPlanRouter } from "./routes/mealPlan.js";
import { youtubeRecipesRouter } from "./routes/youtubeRecipes.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    aiMode: process.env.ANTHROPIC_API_KEY ? "ai" : "mock",
    youtubeMode: process.env.YOUTUBE_API_KEY ? "live" : "mock",
  });
});

app.use("/api/meal-plan", mealPlanRouter);
app.use("/api/youtube-recipes", youtubeRecipesRouter);

app.listen(PORT, () => {
  console.log(`Meal planner API listening on http://localhost:${PORT}`);
});
