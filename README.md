# AI Meal Planner

An AI-powered meal planning app. Generate a personalized multi-day meal plan
(with a consolidated shopping list) from your dietary preferences, and
discover recipe videos on YouTube ranked by how positively viewers reacted
in the comments.

## Features

- **AI meal plan generator** — set diet type, calorie target, allergies,
  disliked ingredients, cuisine preferences, days, and meals/day; get back a
  structured plan with per-meal macros, ingredients, and instructions, plus
  a de-duplicated shopping list grouped by category (downloadable as `.txt`).
- **YouTube recipe discovery** — search a dish and get candidate recipe
  videos ranked by a *feedback score* that blends like ratio with sentiment
  analysis of the video's top comments, surfacing the best-received recipes
  first, with sample positive comments shown per result.
- **Works without API keys** — both features fall back to a deterministic
  offline/mock mode so the app is fully demoable with zero setup.
- **Servings converter** — every recipe has a servings stepper that scales
  ingredient quantities and calories/macros proportionally, so a recipe
  sized for 2 can be converted to feed 6 (or scaled down to 1) instantly.
- **Swap a meal** — don't like a suggestion? Regenerate just that one meal
  (via Claude, or the offline generator) without touching the rest of the
  plan.
- **Favorites** — star any meal to save it to a dedicated Favorites tab,
  persisted across sessions.
- **Interactive shopping list** — check off items as you shop; progress and
  checked state persist across reloads.
- **Daily nutrition summary** — each day shows total calories against your
  target plus a macro breakdown.
- **YouTube → plan** — add a YouTube search result directly into a chosen
  day of your meal plan.
- **Persistent state** — your preferences, generated plan, favorites, and
  shopping progress are saved to `localStorage` and restored on reload.

## Stack

- `client/` — React + TypeScript + Vite + Tailwind CSS
- `server/` — Express + TypeScript, using the Anthropic Claude API and the
  YouTube Data API v3

## Setup

```bash
npm install
```

Copy the server env file and add your keys (optional — see "Mock mode" below):

```bash
cp server/.env.example server/.env
```

```
# server/.env
PORT=4000
ANTHROPIC_API_KEY=sk-ant-...   # optional
YOUTUBE_API_KEY=AIza...        # optional
```

## Run locally

```bash
npm run dev
```

This starts the API server on `http://localhost:4000` and the Vite dev
server on `http://localhost:5173` (which proxies `/api` to the server).

## Mock mode

If `ANTHROPIC_API_KEY` is not set, `/api/meal-plan/generate` returns a
deterministic offline-generated plan instead of calling Claude. If
`YOUTUBE_API_KEY` is not set, `/api/youtube-recipes/search` returns sample
ranked results instead of calling the YouTube Data API. Both endpoints
report which mode they ran in (`"ai"`/`"mock"` and `"live"`/`"mock"`
respectively), and the UI shows a banner when running in mock mode.

## Getting API keys

- **Anthropic API key**: create one at the Anthropic Console.
- **YouTube Data API v3 key**: enable "YouTube Data API v3" in a Google
  Cloud project and create an API key under APIs & Services → Credentials.
  The app uses the `search`, `videos`, and `commentThreads` endpoints, all
  within the standard free daily quota for light use.

## Project structure

```
client/   React frontend (preferences form, meal plan view, YouTube finder)
server/   Express API
  src/routes/       HTTP route handlers
  src/services/      Claude + YouTube integrations, sentiment scoring, mock generators
```

## Build

```bash
npm run build
```

## How comment sentiment ranking works

For each candidate video, the server fetches up to 40 top comments and
classifies each as positive/negative/neutral using a keyword-based
sentiment heuristic. The final `feedbackScore` (0–100) combines:

- like-to-view ratio (40%)
- share of judged comments that are positive (50%)
- comment volume, as a light confidence weight (10%)

Videos are sorted by this score, so recipes with strong genuine viewer
approval surface above those with more views but worse reception.
