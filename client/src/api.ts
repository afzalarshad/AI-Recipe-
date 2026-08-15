import type { Meal, MealPlanPreferences, MealPlanResponse, YoutubeSearchResponse } from "./types";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export async function generateMealPlan(preferences: MealPlanPreferences): Promise<MealPlanResponse> {
  const res = await fetch("/api/meal-plan/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preferences),
  });
  return handleResponse<MealPlanResponse>(res);
}

export async function searchYoutubeRecipes(query: string): Promise<YoutubeSearchResponse> {
  const res = await fetch(`/api/youtube-recipes/search?q=${encodeURIComponent(query)}`);
  return handleResponse<YoutubeSearchResponse>(res);
}

export async function regenerateMeal(
  preferences: MealPlanPreferences,
  mealType: string,
  excludeNames: string[],
): Promise<{ meal: Meal; mode: "ai" | "mock" }> {
  const res = await fetch("/api/meal-plan/regenerate-meal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preferences, mealType, excludeNames }),
  });
  return handleResponse<{ meal: Meal; mode: "ai" | "mock" }>(res);
}
