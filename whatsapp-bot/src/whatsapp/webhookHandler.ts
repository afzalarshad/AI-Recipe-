import { answerRecipeQuery } from "./assistant.js";
import { downloadWhatsAppMedia, markWhatsAppMessageRead, sendWhatsAppText } from "./client.js";
import { transcribeVoiceNote } from "./transcription.js";
import type { WhatsAppMessage, WhatsAppWebhookPayload } from "./types.js";

export async function handleIncomingWebhook(payload: WhatsAppWebhookPayload): Promise<void> {
  const messages = payload.entry?.flatMap((entry) => entry.changes.flatMap((c) => c.value.messages ?? [])) ?? [];

  for (const message of messages) {
    // Process sequentially and never let one bad message take down the whole batch.
    await handleMessage(message).catch((err) => {
      console.error("[whatsapp] Failed to handle message:", err);
    });
  }
}

async function handleMessage(message: WhatsAppMessage): Promise<void> {
  await markWhatsAppMessageRead(message.id);

  const query = await resolveQueryText(message);
  if (query === null) return; // Already replied with a clarifying message inside resolveQueryText.

  try {
    const answer = await answerRecipeQuery(query);
    await sendWhatsAppText(message.from, answer.text);
  } catch (err) {
    console.error("[whatsapp] Failed to answer query:", err);
    await sendWhatsAppText(
      message.from,
      "Maaf kijiye, abhi jawab dene mein masla ho raha hai. Thori dair baad dobara koshish karein.",
    );
  }
}

/** Returns the text to answer, or null if a reply was already sent and no further action is needed. */
async function resolveQueryText(message: WhatsAppMessage): Promise<string | null> {
  if (message.type === "text" && "text" in message) {
    return message.text.body;
  }

  if (message.type === "audio" && "audio" in message) {
    try {
      const audioBuffer = await downloadWhatsAppMedia(message.audio.id);
      const transcript = await transcribeVoiceNote(audioBuffer, message.audio.mime_type);

      if (transcript === null) {
        await sendWhatsAppText(
          message.from,
          "Voice notes abhi is bot par support nahi hain (transcription configure nahi hai). Barah-e-meherbani apna sawal type kar ke bhejein.",
        );
        return null;
      }

      if (!transcript) {
        await sendWhatsAppText(message.from, "Aap ki voice note samajh nahi aayi, barah-e-meherbani dobara bolein ya type karein.");
        return null;
      }

      return transcript;
    } catch (err) {
      console.error("[whatsapp] Voice note transcription failed:", err);
      await sendWhatsAppText(
        message.from,
        "Voice note process karne mein masla hua. Barah-e-meherbani apna sawal type kar ke bhejein.",
      );
      return null;
    }
  }

  await sendWhatsAppText(
    message.from,
    "Is type ka message abhi support nahi hai. Barah-e-meherbani text ya voice note bhejein.",
  );
  return null;
}
