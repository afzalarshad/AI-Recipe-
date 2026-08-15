# Kun Foods WhatsApp Bot

A standalone WhatsApp bot for Kun Foods. Customers can text a dish name or
send a **voice note** and get the recipe's ingredients and steps back,
answered by Claude, grounded only in Kun Foods' own recipe data.

## How it works

1. Incoming WhatsApp text is used directly; incoming voice notes are
   downloaded and transcribed via OpenAI Whisper.
2. The query is keyword-matched against `data/kunFoodsRecipes.json` to find
   the most relevant recipe(s).
3. Those recipes are given to Claude as the *only* allowed context, so
   answers stay grounded in Kun Foods' real recipes — Claude replies in
   whatever language/script the customer used (Urdu, Roman Urdu, or
   English).
4. The answer is sent back on the same WhatsApp thread.

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env` — see "Getting credentials" below. Every credential is
optional for local development; the bot runs in mock mode without any of
them (see "Mock mode").

## 1. Add your real recipes

Edit `data/kunFoodsRecipes.json` — it's currently seeded with a few
**placeholder** Pakistani dish examples so the bot is demoable out of the
box. Replace them with Kun Foods' actual recipes. Each entry needs:

```json
{
  "id": "unique-id",
  "name": "Recipe name",
  "category": "e.g. Main Course",
  "tags": ["keywords", "used", "for", "search"],
  "description": "One-line description",
  "servings": 4,
  "ingredients": ["..."],
  "instructions": ["..."]
}
```

The file is re-read on every query, so edits apply immediately — no
restart needed. The bot only answers from what's in this file; it won't
invent recipes.

## 2. Run locally and test without WhatsApp

```bash
npm run dev
```

```bash
curl -X POST http://localhost:4100/whatsapp/test-query \
  -H "Content-Type: application/json" \
  -d '{"query": "chicken karahi kaise banani hai"}'
```

This exercises the same recipe-search + Claude-answer pipeline the real
webhook uses, so you can validate your recipe data and answers before
connecting a real WhatsApp number.

## 3. Connect a real WhatsApp number (Meta Cloud API)

1. Create a Meta developer app at developers.facebook.com and add the
   **WhatsApp** product. This gives you a test phone number, an
   `access token`, and a `phone number ID`.
2. Set in `.env`:
   ```
   WHATSAPP_ACCESS_TOKEN=...
   WHATSAPP_PHONE_NUMBER_ID=...
   WHATSAPP_VERIFY_TOKEN=any-string-you-choose
   WHATSAPP_APP_SECRET=...        # from the app's Basic Settings
   OPENAI_API_KEY=sk-...          # optional, enables voice note transcription
   ANTHROPIC_API_KEY=sk-ant-...   # optional, enables Claude-written answers
   ```
3. Expose your local server publicly for the webhook (e.g. `ngrok http 4100`).
4. In the Meta app's WhatsApp → Configuration page, set the webhook URL to
   `https://<your-ngrok-domain>/whatsapp/webhook` and the verify token to
   the same value as `WHATSAPP_VERIFY_TOKEN`. Meta calls the URL once to
   confirm it (handled by the `GET /whatsapp/webhook` handshake route).
5. Subscribe the webhook to the `messages` field.
6. Message the test number from WhatsApp — text or a voice note both work.

## Getting credentials

- **Anthropic API key**: create one at the Anthropic Console.
- **OpenAI API key**: create one at platform.openai.com — only needed for
  voice note transcription (Whisper).
- **WhatsApp Cloud API**: from a Meta developer app's WhatsApp product
  page, as described above.

## Mock mode

- Without `ANTHROPIC_API_KEY`, the bot still replies, using a deterministic
  fallback that returns the best-matching recipe's ingredients and steps
  directly (no LLM-written phrasing).
- Without `WHATSAPP_ACCESS_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID`, outgoing
  sends are skipped (logged, not thrown) — useful for testing the webhook
  handler without a real WhatsApp connection.
- Without `OPENAI_API_KEY`, voice notes get a reply asking the sender to
  type their question instead.

`GET /health` reports which mode each integration is running in.

## Project structure

```
src/
  index.ts              Express app entry point
  routes/whatsapp.ts     Webhook + local test-query routes
  whatsapp/
    client.ts             WhatsApp Cloud API: send, mark-read, media download, signature verify
    config.ts              Env var reading
    knowledgeBase.ts        Loads + keyword-searches data/kunFoodsRecipes.json
    transcription.ts        Voice note transcription (OpenAI Whisper)
    assistant.ts             Claude RAG answer generation
    webhookHandler.ts         Ties it all together for an incoming message
data/kunFoodsRecipes.json  Recipe knowledge base (edit this to add real recipes)
```

## Build

```bash
npm run build
npm start
```
