import { useState } from "react";
import type { Meal } from "../types";
import { scaleAmount, scaleIngredients } from "../utils/scaleRecipe";

interface Props {
  meal: Meal;
  baseServings: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSwap?: () => Promise<void>;
}

export function RecipeCard({ meal, baseServings, isFavorite, onToggleFavorite, onSwap }: Props) {
  const [servings, setServings] = useState(baseServings);
  const [swapping, setSwapping] = useState(false);

  const factor = servings / baseServings;
  const ingredients = scaleIngredients(meal.ingredients, factor);
  const calories = scaleAmount(meal.calories, factor);
  const protein = scaleAmount(meal.protein, factor);
  const carbs = scaleAmount(meal.carbs, factor);
  const fat = scaleAmount(meal.fat, factor);

  async function handleSwap() {
    if (!onSwap) return;
    setSwapping(true);
    try {
      await onSwap();
      setServings(baseServings);
    } finally {
      setSwapping(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full mb-1">
            {meal.type}
          </span>
          <h4 className="font-medium text-gray-900">{meal.name}</h4>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleFavorite}
            title={isFavorite ? "Remove from favorites" : "Save to favorites"}
            className={`text-lg leading-none ${isFavorite ? "text-amber-500" : "text-gray-300 hover:text-amber-400"}`}
          >
            {isFavorite ? "★" : "☆"}
          </button>
          <span className="text-sm text-gray-500 whitespace-nowrap">{calories} kcal</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 mt-1">{meal.description}</p>

      <div className="flex gap-3 mt-2 text-xs text-gray-500">
        <span>Protein: {protein}g</span>
        <span>Carbs: {carbs}g</span>
        <span>Fat: {fat}g</span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Servings</span>
          <div className="flex items-center border border-gray-200 rounded-md">
            <button
              onClick={() => setServings((s) => Math.max(1, s - 1))}
              className="w-6 h-6 text-gray-500 hover:bg-gray-50 rounded-l-md"
              aria-label="Decrease servings"
            >
              −
            </button>
            <span className="w-7 text-center text-sm">{servings}</span>
            <button
              onClick={() => setServings((s) => Math.min(24, s + 1))}
              className="w-6 h-6 text-gray-500 hover:bg-gray-50 rounded-r-md"
              aria-label="Increase servings"
            >
              +
            </button>
          </div>
        </div>

        {onSwap && (
          <button
            onClick={handleSwap}
            disabled={swapping}
            className="text-xs font-medium text-brand-700 hover:text-brand-800 disabled:opacity-50"
          >
            {swapping ? "Swapping..." : "🔁 Swap meal"}
          </button>
        )}
      </div>

      <details className="mt-3">
        <summary className="text-sm text-brand-700 cursor-pointer font-medium">Ingredients & instructions</summary>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <div>
            <h5 className="text-xs font-semibold text-gray-700 mb-1">
              Ingredients {factor !== 1 && <span className="font-normal text-gray-400">(for {servings})</span>}
            </h5>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-0.5">
              {ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-semibold text-gray-700 mb-1">Instructions</h5>
            <ol className="text-sm text-gray-600 list-decimal list-inside space-y-0.5">
              {meal.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </details>
    </div>
  );
}
