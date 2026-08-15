import { useState } from "react";
import { PreferencesForm } from "./components/PreferencesForm";
import { MealPlanView } from "./components/MealPlanView";
import { YoutubeRecipeFinder } from "./components/YoutubeRecipeFinder";
import { generateMealPlan } from "./api";
import type { MealPlan, MealPlanPreferences } from "./types";

type Tab = "planner" | "youtube";

export default function App() {
  const [tab, setTab] = useState<Tab>("planner");
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [mode, setMode] = useState<"ai" | "mock">("mock");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(preferences: MealPlanPreferences) {
    setLoading(true);
    setError(null);
    try {
      const res = await generateMealPlan(preferences);
      setPlan(res.plan);
      setMode(res.mode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-brand-700">🥗 AI Meal Planner</h1>
          <nav className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <TabButton active={tab === "planner"} onClick={() => setTab("planner")}>
              Meal Planner
            </TabButton>
            <TabButton active={tab === "youtube"} onClick={() => setTab("youtube")}>
              YouTube Recipes
            </TabButton>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === "planner" ? (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <PreferencesForm onSubmit={handleGenerate} loading={loading} />
            <div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
                  {error}
                </div>
              )}
              {plan ? (
                <MealPlanView plan={plan} mode={mode} />
              ) : (
                <div className="text-gray-400 text-sm border border-dashed border-gray-300 rounded-xl p-10 text-center">
                  Fill in your preferences and generate a plan to see it here.
                </div>
              )}
            </div>
          </div>
        ) : (
          <YoutubeRecipeFinder />
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
