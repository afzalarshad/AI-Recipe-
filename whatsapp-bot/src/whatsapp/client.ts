import { createHmac, timingSafeEqual } from "node:crypto";
import { whatsappConfig } from "./config.js";

function graphUrl(pathSegment: string): string {
  return `https://graph.facebook.com/${whatsappConfig.apiVersion}/${pathSegment}`;
}

async function graphFetch(pathSegment: string, init: RequestInit): Promise<Response> {
  const res = await fetch(graphUrl(pathSegment), {
    ...init,
    headers: {
      Authorization: `Bearer ${whatsappConfig.accessToken}`,
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WhatsApp Graph API error (${res.status}): ${body}`);
  }
  return res;
}

export async function sendWhatsAppText(to: string, body: string): Promise<void> {
  if (!whatsappConfig.isConfigured) {
    console.warn("[whatsapp] Not configured (missing WHATSAPP_ACCESS_TOKEN/WHATSAPP_PHONE_NUMBER_ID) — skipping send.");
    return;
  }

  await graphFetch(`${whatsappConfig.phoneNumberId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });
}

export async function markWhatsAppMessageRead(messageId: string): Promise<void> {
  if (!whatsappConfig.isConfigured) return;

  try {
    await graphFetch(`${whatsappConfig.phoneNumberId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      }),
    });
  } catch (err) {
    // Non-critical — a failed read receipt shouldn't block answering the user.
    console.warn("[whatsapp] Failed to mark message as read:", err);
  }
}

/** Resolves a media ID to a downloadable URL, then downloads it (used for incoming voice notes). */
export async function downloadWhatsAppMedia(mediaId: string): Promise<Buffer> {
  const metaRes = await graphFetch(mediaId, { method: "GET" });
  const meta = (await metaRes.json()) as { url: string };

  const fileRes = await fetch(meta.url, {
    headers: { Authorization: `Bearer ${whatsappConfig.accessToken}` },
  });
  if (!fileRes.ok) {
    throw new Error(`Failed to download WhatsApp media (${fileRes.status})`);
  }
  const arrayBuffer = await fileRes.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Verifies the X-Hub-Signature-256 header Meta sends on webhook POSTs, using the raw request
 * body. Skipped (returns true) when WHATSAPP_APP_SECRET isn't set, to keep local dev/testing
 * frictionless — set the secret before exposing the webhook publicly.
 */
export function verifyWhatsAppSignature(rawBody: Buffer, signatureHeader: string | undefined): boolean {
  if (!whatsappConfig.appSecret) return true;
  if (!signatureHeader) return false;

  const expected = "sha256=" + createHmac("sha256", whatsappConfig.appSecret).update(rawBody).digest("hex");

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signatureHeader);
  if (expectedBuf.length !== actualBuf.length) return false;

  return timingSafeEqual(expectedBuf, actualBuf);
}
