import "dotenv/config";
import cors from "cors";
import express from "express";
import { whatsappRouter } from "./routes/whatsapp.js";
import { whatsappConfig, transcriptionConfig, anthropicConfig } from "./whatsapp/config.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4100;

app.use(cors());
app.use(
  express.json({
    limit: "5mb",
    // Captures the raw bytes so the WhatsApp webhook can verify Meta's X-Hub-Signature-256 header.
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
    },
  }),
);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    aiMode: anthropicConfig.isConfigured ? "ai" : "mock",
    whatsappMode: whatsappConfig.isConfigured ? "live" : "unconfigured",
    voiceTranscriptionMode: transcriptionConfig.isConfigured ? "live" : "unconfigured",
  });
});

app.use("/whatsapp", whatsappRouter);

app.listen(PORT, () => {
  console.log(`Kun Foods WhatsApp bot listening on http://localhost:${PORT}`);
});
