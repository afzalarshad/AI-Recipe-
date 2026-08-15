export interface WhatsAppTextMessage {
  from: string;
  id: string;
  timestamp: string;
  type: "text";
  text: { body: string };
}

export interface WhatsAppAudioMessage {
  from: string;
  id: string;
  timestamp: string;
  type: "audio";
  audio: { id: string; mime_type: string };
}

export type WhatsAppMessage = WhatsAppTextMessage | WhatsAppAudioMessage | { from: string; id: string; type: string };

export interface WhatsAppWebhookPayload {
  object: string;
  entry: {
    id: string;
    changes: {
      value: {
        messaging_product: "whatsapp";
        metadata: { phone_number_id: string };
        messages?: WhatsAppMessage[];
      };
      field: string;
    }[];
  }[];
}
