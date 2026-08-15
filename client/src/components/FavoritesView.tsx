import type { FavoriteMeal } from "../types";
import { RecipeCard } from "./RecipeCard";

interface Props {
  favorites: FavoriteMeal[];
  baseServings: number;
  onRemove: (day: string, meal: FavoriteMeal) => void;
}

export function FavoritesView({ favorites, baseServings, onRemove }: Props) {
  if (favorites.length === 0) {
    return (
      <div className="text-gray-400 text-sm border border-dashed border-gray-300 rounded-xl p-10 text-center">
        No favorites yet — star a meal from your plan to save it here.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {favorites.map((meal, i) => (
        <div key={i}>
          <p className="text-xs text-gray-400 mb-1">Saved from {meal.day}</p>
          <RecipeCard
            meal={meal}
            baseServings={baseServings}
            isFavorite
            onToggleFavorite={() => onRemove(meal.day, meal)}
          />
        </div>
      ))}
    </div>
  );
}
