import type { DayPlan, Meal, MealPlan, MealPlanPreferences, ShoppingListItem } from "../types.js";

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

const BASE_MEALS: Record<string, string[]> = {
  Breakfast: ["Oatmeal Bowl", "Veggie Omelette", "Greek Yogurt Parfait", "Avocado Toast"],
  Lunch: ["Grilled Chicken Salad", "Quinoa Buddha Bowl", "Lentil Soup", "Turkey Wrap"],
  Dinner: ["Baked Salmon", "Stir-Fried Tofu & Veggies", "Beef & Broccoli", "Vegetable Curry"],
  Snack: ["Mixed Nuts", "Fruit & Cottage Cheese", "Hummus & Carrots", "Protein Shake"],
};

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

/**
 * Deterministic offline generator used when no ANTHROPIC_API_KEY is configured,
 * so the app remains fully demoable without API costs.
 */
export function generateMockPlan(prefs: MealPlanPreferences): MealPlan {
  const days: DayPlan[] = [];
  const shoppingMap = new Map<string, ShoppingListItem>();

  for (let d = 0; d < prefs.days; d++) {
    const meals: Meal[] = [];
    for (let m = 0; m < prefs.mealsPerDay; m++) {
      const type = MEAL_TYPES[m % MEAL_TYPES.length];
      const name = pick(BASE_MEALS[type], d + m);
      const perMealCalories = Math.round(prefs.calorieTarget / prefs.mealsPerDay);
      const ingredients = mockIngredients(type, prefs);
      ingredients.forEach((ing) => {
        if (!shoppingMap.has(ing.item)) {
          shoppingMap.set(ing.item, ing);
        }
      });

      meals.push({
        type,
        name: `${name}${prefs.dietType !== "none" ? ` (${prefs.dietType})` : ""}`,
        description: `A ${prefs.dietType !== "none" ? prefs.dietType + " " : ""}${type.toLowerCase()} option tailored to your preferences.`,
        calories: perMealCalories,
        protein: Math.round((perMealCalories * 0.25) / 4),
        carbs: Math.round((perMealCalories * 0.45) / 4),
        fat: Math.round((perMealCalories * 0.3) / 9),
        ingredients: ingredients.map((i) => `${i.quantity} ${i.item}`),
        instructions: [
          "Prep and wash all ingredients.",
          "Cook proteins and vegetables as needed.",
          "Combine, season to taste, and serve.",
        ],
      });
    }
    days.push({ day: DAY_NAMES[d % DAY_NAMES.length], meals });
  }

  return {
    summary: `A ${prefs.days}-day ${prefs.dietType !== "none" ? prefs.dietType + " " : ""}meal plan targeting ~${prefs.calorieTarget} kcal/day, generated in offline demo mode.`,
    days,
    shoppingList: Array.from(shoppingMap.values()),
  };
}

function mockIngredients(type: string, prefs: MealPlanPreferences): ShoppingListItem[] {
  const base: Record<string, ShoppingListItem[]> = {
    Breakfast: [
      { item: "Rolled oats", quantity: "1 cup", category: "Grains" },
      { item: "Eggs", quantity: "3", category: "Dairy & Eggs" },
      { item: "Berries", quantity: "1/2 cup", category: "Produce" },
    ],
    Lunch: [
      { item: "Mixed greens", quantity: "2 cups", category: "Produce" },
      { item: "Chicken breast", quantity: "150g", category: "Meat & Seafood" },
      { item: "Quinoa", quantity: "1/2 cup", category: "Grains" },
    ],
    Dinner: [
      { item: "Salmon fillet", quantity: "150g", category: "Meat & Seafood" },
      { item: "Broccoli", quantity: "1 cup", category: "Produce" },
      { item: "Olive oil", quantity: "1 tbsp", category: "Pantry" },
    ],
    Snack: [
      { item: "Almonds", quantity: "1/4 cup", category: "Pantry" },
      { item: "Greek yogurt", quantity: "1 cup", category: "Dairy & Eggs" },
    ],
  };

  const items = base[type] ?? [];
  const allergySet = new Set(prefs.allergies.map((a) => a.toLowerCase()));
  return items.filter((i) => !allergySet.has(i.item.toLowerCase()));
}
