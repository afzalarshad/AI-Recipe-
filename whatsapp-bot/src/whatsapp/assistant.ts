import Anthropic from "@anthropic-ai/sdk";
import { anthropicConfig } from "./config.js";
import { searchRecipes, type KunFoodsRecipe } from "./knowledgeBase.js";

const MODEL = "claude-sonnet-5";

function formatRecipeContext(recipes: KunFoodsRecipe[]): string {
  if (recipes.length === 0) return "No matching recipes were found in the Kun Foods recipe database.";

  return recipes
    .map(
      (r) => `### ${r.name} (${r.category}, serves ${r.servings})
${r.description}

Ingredients:
${r.ingredients.map((i) => `- ${i}`).join("\n")}

Instructions:
${r.instructions.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    )
    .join("\n\n");
}

function buildSystemPrompt(): string {
  return `You are the WhatsApp recipe assistant for Kun Foods. You answer customer questions about Kun Foods recipes: ingredients, quantities, cooking steps, substitutions, and cooking tips.

Rules:
- Only answer using the recipe context provided below. If the question isn't about a recipe in the context, say you don't have that recipe and suggest the closest match from the context if one exists.
- Reply in the same language/script the customer used (Urdu, Roman Urdu, or English) — match their style.
- Keep answers short and conversational, formatted for a WhatsApp chat (no markdown headers, plain text with line breaks and simple dashes for lists).
- Do not invent ingredients, quantities, or steps that aren't in the context.`;
}

export interface AssistantAnswer {
  text: string;
  matchedRecipeNames: string[];
}

export async function answerRecipeQuery(query: string): Promise<AssistantAnswer> {
  const matches = searchRecipes(query, 3);
  const context = formatRecipeContext(matches);

  if (!anthropicConfig.isConfigured) {
    return {
      text: fallbackAnswer(matches, query),
      matchedRecipeNames: matches.map((m) => m.name),
    };
  }

  const client = new Anthropic({ apiKey: anthropicConfig.apiKey });
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    system: buildSystemPrompt(),
    messages: [
      {
        role: "user",
        content: `Recipe context:\n${context}\n\nCustomer question: ${query}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const text = textBlock && textBlock.type === "text" ? textBlock.text : fallbackAnswer(matches, query);

  return { text, matchedRecipeNames: matches.map((m) => m.name) };
}

/** Used when no ANTHROPIC_API_KEY is configured, so the bot still replies with something useful. */
function fallbackAnswer(matches: KunFoodsRecipe[], query: string): string {
  if (matches.length === 0) {
    return `Maaf kijiye, mujhe "${query}" se related koi Kun Foods recipe nahi mili. Kisi aur dish ka naam bata kar dobara puchein.`;
  }

  const top = matches[0];
  return `${top.name}\n\nIngredients:\n${top.ingredients.map((i) => `- ${i}`).join("\n")}\n\nSteps:\n${top.instructions
    .map((s, i) => `${i + 1}. ${s}`)
    .join("\n")}`;
}
