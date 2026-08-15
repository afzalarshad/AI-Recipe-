export const whatsappConfig = {
  get accessToken() {
    return process.env.WHATSAPP_ACCESS_TOKEN ?? "";
  },
  get phoneNumberId() {
    return process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";
  },
  get verifyToken() {
    return process.env.WHATSAPP_VERIFY_TOKEN ?? "";
  },
  get appSecret() {
    return process.env.WHATSAPP_APP_SECRET ?? "";
  },
  get apiVersion() {
    return process.env.WHATSAPP_API_VERSION ?? "v20.0";
  },
  get isConfigured() {
    return Boolean(this.accessToken && this.phoneNumberId);
  },
};

export const transcriptionConfig = {
  get openaiApiKey() {
    return process.env.OPENAI_API_KEY ?? "";
  },
  get isConfigured() {
    return Boolean(this.openaiApiKey);
  },
};

export const anthropicConfig = {
  get apiKey() {
    return process.env.ANTHROPIC_API_KEY ?? "";
  },
  get isConfigured() {
    return Boolean(this.apiKey);
  },
};
