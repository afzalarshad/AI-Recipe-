import type { MealPlan } from "../types";
import { RecipeCard } from "./RecipeCard";
import { ShoppingList } from "./ShoppingList";

export function MealPlanView({ plan, mode }: { plan: MealPlan; mode: "ai" | "mock" }) {
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
        {plan.days.map((day) => (
          <div key={day.day}>
            <h3 className="text-base font-semibold text-gray-900 mb-2">{day.day}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {day.meals.map((meal, i) => (
                <RecipeCard key={i} meal={meal} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <ShoppingList items={plan.shoppingList} />
    </div>
  );
}
