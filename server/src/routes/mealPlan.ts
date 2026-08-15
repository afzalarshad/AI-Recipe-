import { Router } from "express";
import type { MealPlanPreferences } from "../types.js";
import { generateMealPlan } from "../services/anthropic.js";

export const mealPlanRouter = Router();

const VALID_DIETS = new Set([
  "none",
  "vegetarian",
  "vegan",
  "keto",
  "paleo",
  "mediterranean",
  "low-carb",
  "high-protein",
]);

function parsePreferences(body: unknown): MealPlanPreferences {
  const b = (body ?? {}) as Record<string, unknown>;

  const days = clampInt(b.days, 1, 14, 7);
  const mealsPerDay = clampInt(b.mealsPerDay, 1, 6, 3);
  const calorieTarget = clampInt(b.calorieTarget, 800, 5000, 2000);
  const servings = clampInt(b.servings, 1, 12, 2);
  const dietType = typeof b.dietType === "string" && VALID_DIETS.has(b.dietType) ? (b.dietType as MealPlanPreferences["dietType"]) : "none";
  const allergies = toStringArray(b.allergies);
  const dislikedIngredients = toStringArray(b.dislikedIngredients);
  const cuisinePreferences = toStringArray(b.cuisinePreferences);
  const notes = typeof b.notes === "string" ? b.notes.slice(0, 500) : undefined;

  return { days, mealsPerDay, calorieTarget, servings, dietType, allergies, dislikedIngredients, cuisinePreferences, notes };
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0).map((v) => v.trim()).slice(0, 30);
}

mealPlanRouter.post("/generate", async (req, res) => {
  try {
    const preferences = parsePreferences(req.body);
    const plan = await generateMealPlan(preferences);
    res.json({ preferences, plan, mode: process.env.ANTHROPIC_API_KEY ? "ai" : "mock" });
  } catch (err) {
    console.error("Failed to generate meal plan:", err);
    res.status(502).json({ error: "Failed to generate meal plan. Please try again." });
  }
});
