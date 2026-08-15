import { transcriptionConfig } from "./config.js";

const WHISPER_URL = "https://api.openai.com/v1/audio/transcriptions";

/**
 * Transcribes a WhatsApp voice note (usually audio/ogg; codecs=opus) using OpenAI's
 * Whisper API. Returns null when no OPENAI_API_KEY is configured, so callers can fall
 * back to asking the user to type their question instead.
 */
export async function transcribeVoiceNote(audio: Buffer, mimeType: string): Promise<string | null> {
  if (!transcriptionConfig.isConfigured) {
    return null;
  }

  const extension = mimeType.includes("ogg") ? "ogg" : mimeType.includes("mp4") ? "mp4" : "m4a";
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(audio)], { type: mimeType }), `voice-note.${extension}`);
  form.append("model", "whisper-1");

  const res = await fetch(WHISPER_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${transcriptionConfig.openaiApiKey}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Transcription failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { text: string };
  return data.text.trim();
}
