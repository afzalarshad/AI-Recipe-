export type DietType =
  | "none"
  | "vegetarian"
  | "vegan"
  | "keto"
  | "paleo"
  | "mediterranean"
  | "low-carb"
  | "high-protein";

export interface MealPlanPreferences {
  days: number;
  mealsPerDay: number;
  dietType: DietType;
  allergies: string[];
  dislikedIngredients: string[];
  cuisinePreferences: string[];
  calorieTarget: number;
  servings: number;
  notes?: string;
}

export interface Meal {
  type: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
}

export interface DayPlan {
  day: string;
  meals: Meal[];
}

export interface ShoppingListItem {
  item: string;
  quantity: string;
  category: string;
}

export interface MealPlan {
  summary: string;
  days: DayPlan[];
  shoppingList: ShoppingListItem[];
}

export interface MealPlanResponse {
  preferences: MealPlanPreferences;
  plan: MealPlan;
  mode: "ai" | "mock";
}

export interface YoutubeRecipeResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  videoUrl: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  feedbackScore: number;
  positiveCommentRatio: number;
  topPositiveComments: string[];
}

export interface YoutubeSearchResponse {
  query: string;
  results: YoutubeRecipeResult[];
  mode: "live" | "mock";
}
