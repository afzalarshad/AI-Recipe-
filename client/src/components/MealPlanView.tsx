import type { Meal, MealPlan } from "../types";
import { RecipeCard } from "./RecipeCard";
import { ShoppingList } from "./ShoppingList";

interface Props {
  plan: MealPlan;
  mode: "ai" | "mock";
  baseServings: number;
  calorieTarget: number;
  favoriteIds: Set<string>;
  onToggleFavorite: (day: string, meal: Meal) => void;
  onSwapMeal: (day: string, mealIndex: number) => Promise<void>;
  shoppingChecked: Record<string, boolean>;
  onToggleShoppingItem: (key: string) => void;
}

export function favoriteId(day: string, meal: Meal): string {
  return `${day}::${meal.type}::${meal.name}`;
}

export function MealPlanView({
  plan,
  mode,
  baseServings,
  calorieTarget,
  favoriteIds,
  onToggleFavorite,
  onSwapMeal,
  shoppingChecked,
  onToggleShoppingItem,
}: Props) {
  return (
    <div className="space-y-6">
      {mode === "mock" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-2">
          Running in offline demo mode (no ANTHROPIC_API_KEY set on the server) — this plan was generated locally,
          not by Claude.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-gray-700">{plan.summary}</p>
      </div>

      <div className="space-y-6">
        {plan.days.map((day) => {
          const totals = day.meals.reduce(
            (acc, m) => ({
              calories: acc.calories + m.calories,
              protein: acc.protein + m.protein,
              carbs: acc.carbs + m.carbs,
              fat: acc.fat + m.fat,
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 },
          );
          const pct = Math.min(100, Math.round((totals.calories / calorieTarget) * 100));

          return (
            <div key={day.day}>
              <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
                <h3 className="text-base font-semibold text-gray-900">{day.day}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 flex-1 min-w-[160px] max-w-xs">
                  <span className="whitespace-nowrap">
                    {totals.calories}/{calorieTarget} kcal
                  </span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct > 100 ? "bg-red-400" : "bg-brand-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="whitespace-nowrap">
                    P{totals.protein} C{totals.carbs} F{totals.fat}
                  </span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {day.meals.map((meal, i) => (
                  <RecipeCard
                    key={i}
                    meal={meal}
                    baseServings={baseServings}
                    isFavorite={favoriteIds.has(favoriteId(day.day, meal))}
                    onToggleFavorite={() => onToggleFavorite(day.day, meal)}
                    onSwap={() => onSwapMeal(day.day, i)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <ShoppingList items={plan.shoppingList} checked={shoppingChecked} onToggle={onToggleShoppingItem} />
    </div>
  );
}
