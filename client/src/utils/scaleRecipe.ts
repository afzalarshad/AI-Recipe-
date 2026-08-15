// Matches a leading quantity at the start of an ingredient string, e.g.
// "1 cup", "1/2 cup", "1 1/2 tbsp", "150g", "3". Captures the numeric part
// and the remainder of the string (unit + ingredient name) separately.
const QUANTITY_RE = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)(\s*.*)$/;

const NICE_FRACTIONS: [number, string][] = [
  [0.25, "1/4"],
  [1 / 3, "1/3"],
  [0.5, "1/2"],
  [2 / 3, "2/3"],
  [0.75, "3/4"],
];

function parseLeadingNumber(token: string): number {
  if (token.includes(" ")) {
    const [whole, frac] = token.split(" ");
    return Number(whole) + parseLeadingNumber(frac);
  }
  if (token.includes("/")) {
    const [num, den] = token.split("/").map(Number);
    return den ? num / den : num;
  }
  return Number(token);
}

function formatScaledNumber(n: number): string {
  if (n <= 0) return "0";
  const whole = Math.floor(n);
  const frac = n - whole;

  for (const [value, label] of NICE_FRACTIONS) {
    if (Math.abs(frac - value) < 0.04) {
      return whole > 0 ? `${whole} ${label}` : label;
    }
  }

  const rounded = Math.round(n * 100) / 100;
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

/** Scales the leading quantity of an ingredient string by `factor`, leaving the unit/name untouched. */
export function scaleIngredient(ingredient: string, factor: number): string {
  const match = ingredient.match(QUANTITY_RE);
  if (!match) return ingredient;

  const [, quantityToken, rest] = match;
  const value = parseLeadingNumber(quantityToken);
  if (!Number.isFinite(value)) return ingredient;

  return `${formatScaledNumber(value * factor)}${rest}`;
}

export function scaleIngredients(ingredients: string[], factor: number): string[] {
  if (factor === 1) return ingredients;
  return ingredients.map((i) => scaleIngredient(i, factor));
}

export function scaleAmount(value: number, factor: number): number {
  return Math.round(value * factor);
}
