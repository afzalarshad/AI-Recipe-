import { useState } from "react";
import { PreferencesForm } from "./components/PreferencesForm";
import { MealPlanView, favoriteId } from "./components/MealPlanView";
import { FavoritesView } from "./components/FavoritesView";
import { YoutubeRecipeFinder } from "./components/YoutubeRecipeFinder";
import { generateMealPlan, regenerateMeal } from "./api";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { FavoriteMeal, Meal, MealPlan, MealPlanPreferences } from "./types";

type Tab = "planner" | "youtube" | "favorites";

const DEFAULT_PREFERENCES: MealPlanPreferences = {
  days: 7,
  mealsPerDay: 3,
  dietType: "none",
  allergies: [],
  dislikedIngredients: [],
  cuisinePreferences: [],
  calorieTarget: 2000,
  servings: 2,
};

export default function App() {
  const [tab, setTab] = useState<Tab>("planner");

  const [preferences, setPreferences] = useLocalStorage<MealPlanPreferences>(
    "mealplanner:preferences",
    DEFAULT_PREFERENCES,
  );
  const [plan, setPlan] = useLocalStorage<MealPlan | null>("mealplanner:plan", null);
  const [mode, setMode] = useLocalStorage<"ai" | "mock">("mealplanner:mode", "mock");
  const [favorites, setFavorites] = useLocalStorage<FavoriteMeal[]>("mealplanner:favorites", []);
  const [shoppingChecked, setShoppingChecked] = useLocalStorage<Record<string, boolean>>(
    "mealplanner:shoppingChecked",
    {},
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(prefs: MealPlanPreferences) {
    setLoading(true);
    setError(null);
    try {
      const res = await generateMealPlan(prefs);
      setPlan(res.plan);
      setMode(res.mode);
      setPreferences(prefs);
      setShoppingChecked({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSwapMeal(day: string, mealIndex: number) {
    if (!plan) return;
    const dayPlan = plan.days.find((d) => d.day === day);
    const currentMeal = dayPlan?.meals[mealIndex];
    if (!dayPlan || !currentMeal) return;

    try {
      const excludeNames = dayPlan.meals.map((m) => m.name);
      const res = await regenerateMeal(preferences, currentMeal.type, excludeNames);

      setPlan({
        ...plan,
        days: plan.days.map((d) =>
          d.day === day
            ? { ...d, meals: d.meals.map((m, i) => (i === mealIndex ? res.meal : m)) }
            : d,
        ),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to swap meal");
    }
  }

  function handleToggleFavorite(day: string, meal: Meal) {
    const id = favoriteId(day, meal);
    setFavorites((cur) => {
      const exists = cur.some((f) => favoriteId(f.day, f) === id);
      if (exists) return cur.filter((f) => favoriteId(f.day, f) !== id);
      return [...cur, { ...meal, day, savedAt: new Date().toISOString() }];
    });
  }

  function handleToggleShoppingItem(key: string) {
    setShoppingChecked((cur) => ({ ...cur, [key]: !cur[key] }));
  }

  function handleAddYoutubeMealToPlan(day: string, meal: Meal) {
    if (!plan) return;
    setPlan({
      ...plan,
      days: plan.days.map((d) => (d.day === day ? { ...d, meals: [...d.meals, meal] } : d)),
    });
  }

  const favoriteIds = new Set(favorites.map((f) => favoriteId(f.day, f)));

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl font-bold text-brand-700">🥗 AI Meal Planner</h1>
          <nav className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <TabButton active={tab === "planner"} onClick={() => setTab("planner")}>
              Meal Planner
            </TabButton>
            <TabButton active={tab === "youtube"} onClick={() => setTab("youtube")}>
              YouTube Recipes
            </TabButton>
            <TabButton active={tab === "favorites"} onClick={() => setTab("favorites")}>
              Favorites {favorites.length > 0 && `(${favorites.length})`}
            </TabButton>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === "planner" && (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <PreferencesForm onSubmit={handleGenerate} loading={loading} initial={preferences} />
            <div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
                  {error}
                </div>
              )}
              {plan ? (
                <MealPlanView
                  plan={plan}
                  mode={mode}
                  baseServings={preferences.servings}
                  calorieTarget={preferences.calorieTarget}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onSwapMeal={handleSwapMeal}
                  shoppingChecked={shoppingChecked}
                  onToggleShoppingItem={handleToggleShoppingItem}
                />
              ) : (
                <div className="text-gray-400 text-sm border border-dashed border-gray-300 rounded-xl p-10 text-center">
                  Fill in your preferences and generate a plan to see it here.
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "youtube" && (
          <YoutubeRecipeFinder
            planDays={plan?.days.map((d) => d.day) ?? []}
            onAddToPlan={handleAddYoutubeMealToPlan}
          />
        )}

        {tab === "favorites" && (
          <FavoritesView favorites={favorites} baseServings={preferences.servings} onRemove={handleToggleFavorite} />
        )}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        active ? "bg-white text-brand-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}
