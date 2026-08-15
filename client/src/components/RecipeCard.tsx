import type { Meal } from "../types";

export function RecipeCard({ meal }: { meal: Meal }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full mb-1">
            {meal.type}
          </span>
          <h4 className="font-medium text-gray-900">{meal.name}</h4>
        </div>
        <span className="text-sm text-gray-500 whitespace-nowrap">{meal.calories} kcal</span>
      </div>

      <p className="text-sm text-gray-600 mt-1">{meal.description}</p>

      <div className="flex gap-3 mt-2 text-xs text-gray-500">
        <span>Protein: {meal.protein}g</span>
        <span>Carbs: {meal.carbs}g</span>
        <span>Fat: {meal.fat}g</span>
      </div>

      <details className="mt-3">
        <summary className="text-sm text-brand-700 cursor-pointer font-medium">Ingredients & instructions</summary>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <div>
            <h5 className="text-xs font-semibold text-gray-700 mb-1">Ingredients</h5>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-0.5">
              {meal.ingredients.map((ing, i) => (
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
