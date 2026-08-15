import { Router } from "express";
import { searchYoutubeRecipes } from "../services/youtube.js";

export const youtubeRecipesRouter = Router();

youtubeRecipesRouter.get("/search", async (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 100) : "";

  if (!query) {
    res.status(400).json({ error: "Query parameter 'q' is required." });
    return;
  }

  try {
    const results = await searchYoutubeRecipes(query);
    res.json({ query, results, mode: process.env.YOUTUBE_API_KEY ? "live" : "mock" });
  } catch (err) {
    console.error("Failed to search YouTube recipes:", err);
    res.status(502).json({ error: "Failed to search YouTube recipes. Please try again." });
  }
});
