import Anthropic from "@anthropic-ai/sdk";
import type { Meal, MealPlan, MealPlanPreferences } from "../types.js";
import { generateMockPlan, regenerateMockMeal } from "./mockPlanner.js";

const MODEL = "claude-sonnet-5";

function buildPrompt(prefs: MealPlanPreferences): string {
  const allergies = prefs.allergies.length ? prefs.allergies.join(", ") : "none";
  const disliked = prefs.dislikedIngredients.length ? prefs.dislikedIngredients.join(", ") : "none";
  const cuisines = prefs.cuisinePreferences.length ? prefs.cuisinePreferences.join(", ") : "no preference";

  return `You are a nutrition assistant. Generate a ${prefs.days}-day meal plan with ${prefs.mealsPerDay} meals per day.

Preferences:
- Diet type: ${prefs.dietType}
- Daily calorie target: ${prefs.calorieTarget} kcal
- Servings per meal: ${prefs.servings}
- Allergies to strictly avoid: ${allergies}
- Disliked ingredients to avoid: ${disliked}
- Preferred cuisines: ${cuisines}
- Additional notes: ${prefs.notes ?? "none"}

Respond with ONLY valid JSON (no markdown fences, no commentary) matching exactly this TypeScript shape:

{
  "summary": string,
  "days": [
    {
      "day": string,
      "meals": [
        {
          "type": string,
          "name": string,
          "description": string,
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number,
          "ingredients": string[],
          "instructions": string[]
        }
      ]
    }
  ],
  "shoppingList": [
    { "item": string, "quantity": string, "category": string }
  ]
}

The shoppingList must be a de-duplicated, consolidated list of all ingredients across every day. Ensure the JSON is syntactically valid and complete.`;
}

function extractJson(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }
  return text;
}

export async function generateMealPlan(prefs: MealPlanPreferences): Promise<MealPlan> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return generateMockPlan(prefs);
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    messages: [{ role: "user", content: buildPrompt(prefs) }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response received from Claude");
  }

  const jsonText = extractJson(textBlock.text);

  let parsed: MealPlan;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    throw new Error("Failed to parse meal plan JSON from Claude response");
  }

  return parsed;
}

function buildRegenerateMealPrompt(prefs: MealPlanPreferences, mealType: string, excludeNames: string[]): string {
  const allergies = prefs.allergies.length ? prefs.allergies.join(", ") : "none";
  const disliked = prefs.dislikedIngredients.length ? prefs.dislikedIngredients.join(", ") : "none";
  const cuisines = prefs.cuisinePreferences.length ? prefs.cuisinePreferences.join(", ") : "no preference";
  const exclude = excludeNames.length ? excludeNames.join(", ") : "none";
  const perMealCalories = Math.round(prefs.calorieTarget / prefs.mealsPerDay);

  return `You are a nutrition assistant. Suggest ONE replacement ${mealType} recipe for a meal plan.

Preferences:
- Diet type: ${prefs.dietType}
- Target calories for this meal: ~${perMealCalories} kcal
- Servings: ${prefs.servings}
- Allergies to strictly avoid: ${allergies}
- Disliked ingredients to avoid: ${disliked}
- Preferred cuisines: ${cuisines}
- Do NOT suggest any of these (already used): ${exclude}

Respond with ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:

{
  "type": "${mealType}",
  "name": string,
  "description": string,
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "ingredients": string[],
  "instructions": string[]
}`;
}

export async function regenerateMeal(
  prefs: MealPlanPreferences,
  mealType: string,
  excludeNames: string[],
): Promise<Meal> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return regenerateMockMeal(prefs, mealType, excludeNames);
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: "user", content: buildRegenerateMealPrompt(prefs, mealType, excludeNames) }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response received from Claude");
  }

  const jsonText = extractJson(textBlock.text);

  try {
    return JSON.parse(jsonText) as Meal;
  } catch (err) {
    throw new Error("Failed to parse meal JSON from Claude response");
  }
}
