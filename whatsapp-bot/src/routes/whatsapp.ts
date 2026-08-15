import { Router, type Request } from "express";
import { whatsappConfig } from "../whatsapp/config.js";
import { verifyWhatsAppSignature } from "../whatsapp/client.js";
import { handleIncomingWebhook } from "../whatsapp/webhookHandler.js";
import { answerRecipeQuery } from "../whatsapp/assistant.js";
import type { WhatsAppWebhookPayload } from "../whatsapp/types.js";

export const whatsappRouter = Router();

type RequestWithRawBody = Request & { rawBody?: Buffer };

// Meta's webhook verification handshake — called once when you register the callback URL.
whatsappRouter.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === whatsappConfig.verifyToken && whatsappConfig.verifyToken) {
    res.status(200).send(challenge);
    return;
  }

  res.sendStatus(403);
});

// Receives incoming messages (text + voice notes) from WhatsApp.
whatsappRouter.post("/webhook", async (req: RequestWithRawBody, res) => {
  const signature = req.header("x-hub-signature-256");
  if (!verifyWhatsAppSignature(req.rawBody ?? Buffer.from(JSON.stringify(req.body)), signature)) {
    res.sendStatus(401);
    return;
  }

  // Acknowledge immediately — Meta expects a fast 200, and message handling can take a few seconds.
  res.sendStatus(200);

  handleIncomingWebhook(req.body as WhatsAppWebhookPayload).catch((err) => {
    console.error("[whatsapp] Unhandled webhook processing error:", err);
  });
});

// Local dev/testing endpoint: exercises the same recipe Q&A logic without needing real
// WhatsApp credentials or a public webhook URL. Not part of the WhatsApp integration itself.
whatsappRouter.post("/test-query", async (req, res) => {
  const query = typeof req.body?.query === "string" ? req.body.query.trim() : "";
  if (!query) {
    res.status(400).json({ error: "Body must include a 'query' string." });
    return;
  }

  try {
    const answer = await answerRecipeQuery(query);
    res.json(answer);
  } catch (err) {
    console.error("[whatsapp] test-query failed:", err);
    res.status(502).json({ error: "Failed to answer query." });
  }
});
