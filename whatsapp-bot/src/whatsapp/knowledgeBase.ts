import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "../../data/kunFoodsRecipes.json");

export interface KunFoodsRecipe {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
}

/**
 * Reads the recipe data fresh on every call (file is small) so edits to
 * kunFoodsRecipes.json take effect immediately without restarting the server.
 */
export function loadRecipes(): KunFoodsRecipe[] {
  try {
    const raw = readFileSync(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw) as { recipes: KunFoodsRecipe[] };
    return parsed.recipes ?? [];
  } catch (err) {
    console.error("Failed to load Kun Foods recipe data:", err);
    return [];
  }
}

function scoreRecipe(recipe: KunFoodsRecipe, queryWords: string[]): number {
  const haystack = [recipe.name, recipe.category, ...recipe.tags, recipe.description]
    .join(" ")
    .toLowerCase();

  return queryWords.reduce((score, word) => (haystack.includes(word) ? score + 1 : score), 0);
}

/** Keyword-matches the query against recipe name/category/tags/description, most relevant first. */
export function searchRecipes(query: string, limit = 3): KunFoodsRecipe[] {
  const queryWords = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);

  if (queryWords.length === 0) return [];

  const recipes = loadRecipes();
  return recipes
    .map((recipe) => ({ recipe, score: scoreRecipe(recipe, queryWords) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.recipe);
}
