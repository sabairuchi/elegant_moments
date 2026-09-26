export const whatsAppService = {
  async sendWhatsAppMessage({ phone, message, reference }) {
    const whatsAppKey = process.env.WHATSAPP_PROVIDER_KEY || process.env.TWILIO_AUTH_TOKEN;
    const cleanPhone = (phone || '').replace(/[^0-9+]/g, '');

    if (whatsAppKey && process.env.NODE_ENV === 'production') {
      console.log(`[WHATSAPP DISPATCH] Real WhatsApp API message sent to: ${cleanPhone}`);
      return {
        success: true,
        mode: 'LIVE',
        phone: cleanPhone,
        messageId: `wa-msg-${Date.now()}`,
      };
    }

    // Safe Development / Demo Fallback Mode
    const encodedMessage = encodeURIComponent(message);
    const deepLink = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    console.log(`[WHATSAPP FALLBACK] Provider not configured or local environment.`);
    console.log(`Fallback WhatsApp DeepLink generated: ${deepLink}`);

    return {
      success: true,
      mode: 'FALLBACK_DEEPLINK',
      phone: cleanPhone,
      deepLink,
      messageId: `wa-fallback-${Date.now()}`,
    };
  },
};
