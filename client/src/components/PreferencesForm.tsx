import { useState } from "react";
import type { DietType, MealPlanPreferences } from "../types";

const DIET_OPTIONS: { value: DietType; label: string }[] = [
  { value: "none", label: "No restriction" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "keto", label: "Keto" },
  { value: "paleo", label: "Paleo" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "low-carb", label: "Low-carb" },
  { value: "high-protein", label: "High-protein" },
];

interface Props {
  onSubmit: (preferences: MealPlanPreferences) => void;
  loading: boolean;
  initial?: MealPlanPreferences;
}

export function PreferencesForm({ onSubmit, loading, initial }: Props) {
  const [days, setDays] = useState(initial?.days ?? 7);
  const [mealsPerDay, setMealsPerDay] = useState(initial?.mealsPerDay ?? 3);
  const [dietType, setDietType] = useState<DietType>(initial?.dietType ?? "none");
  const [calorieTarget, setCalorieTarget] = useState(initial?.calorieTarget ?? 2000);
  const [servings, setServings] = useState(initial?.servings ?? 2);
  const [allergies, setAllergies] = useState(initial?.allergies.join(", ") ?? "");
  const [dislikedIngredients, setDislikedIngredients] = useState(initial?.dislikedIngredients.join(", ") ?? "");
  const [cuisinePreferences, setCuisinePreferences] = useState(initial?.cuisinePreferences.join(", ") ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function toList(value: string): string[] {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      days,
      mealsPerDay,
      dietType,
      calorieTarget,
      servings,
      allergies: toList(allergies),
      dislikedIngredients: toList(dislikedIngredients),
      cuisinePreferences: toList(cuisinePreferences),
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-900">Your preferences</h2>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Days">
          <input
            type="number"
            min={1}
            max={14}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="input"
          />
        </Field>
        <Field label="Meals per day">
          <input
            type="number"
            min={1}
            max={6}
            value={mealsPerDay}
            onChange={(e) => setMealsPerDay(Number(e.target.value))}
            className="input"
          />
        </Field>
        <Field label="Daily calorie target">
          <input
            type="number"
            min={800}
            max={5000}
            step={50}
            value={calorieTarget}
            onChange={(e) => setCalorieTarget(Number(e.target.value))}
            className="input"
          />
        </Field>
        <Field label="Servings per meal">
          <input
            type="number"
            min={1}
            max={12}
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className="input"
          />
        </Field>
      </div>

      <Field label="Diet type">
        <select value={dietType} onChange={(e) => setDietType(e.target.value as DietType)} className="input">
          {DIET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Allergies (comma-separated)">
        <input
          type="text"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          placeholder="e.g. peanuts, shellfish"
          className="input"
        />
      </Field>

      <Field label="Disliked ingredients (comma-separated)">
        <input
          type="text"
          value={dislikedIngredients}
          onChange={(e) => setDislikedIngredients(e.target.value)}
          placeholder="e.g. mushrooms, cilantro"
          className="input"
        />
      </Field>

      <Field label="Preferred cuisines (comma-separated)">
        <input
          type="text"
          value={cuisinePreferences}
          onChange={(e) => setCuisinePreferences(e.target.value)}
          placeholder="e.g. Italian, Pakistani, Thai"
          className="input"
        />
      </Field>

      <Field label="Notes (optional)">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Anything else the planner should know"
          className="input"
        />
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
      >
        {loading ? "Generating plan..." : "Generate meal plan"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );
}
