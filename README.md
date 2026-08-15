# Kun Foods WhatsApp Bot

A WhatsApp bot for Kun Foods. Customers can text a dish name or send a
**voice note** and get the recipe's ingredients and steps back, answered by
Claude, grounded only in Kun Foods' own recipe data.

The project lives in [`whatsapp-bot/`](whatsapp-bot/) — see
[`whatsapp-bot/README.md`](whatsapp-bot/README.md) for full setup
instructions (installing, adding real Kun Foods recipes, local testing,
and connecting a real WhatsApp number via Meta's Cloud API).

## Quick start

```bash
cd whatsapp-bot
npm install
cp .env.example .env
npm run dev
```

```bash
curl -X POST http://localhost:4100/whatsapp/test-query \
  -H "Content-Type: application/json" \
  -d '{"query": "chicken karahi kaise banani hai"}'
```
