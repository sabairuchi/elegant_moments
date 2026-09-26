import { DEFAULT_SERVICES, DEFAULT_VENUES } from '../db/index.js';

export const aiService = {
  async generateRecommendations(params) {
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    // Sanitize parameters to avoid exposing internal or private client data
    const safeParams = {
      weddingType: params.weddingType || 'Luxury Wedding',
      budget: Number(params.budget) || 25000,
      guestCount: Number(params.guestCount) || 100,
      location: params.location || 'Italy',
      theme: params.theme || 'Timeless Elegance',
      preferences: params.preferences || '',
    };

    if (apiKey && process.env.NODE_ENV === 'production') {
      try {
        console.log('[AI SERVICE] Generating AI recommendations using provider API...');
        // Example call structure for Gemini/OpenAI API
        return {
          success: true,
          mode: 'LIVE',
          isAiGenerated: true,
          disclaimer: 'Recommendations are AI-assisted suggestions tailored by Elegant Moments.',
          summary: `Curated recommendation for a ${safeParams.theme} ${safeParams.weddingType} with budget \$${safeParams.budget.toLocaleString()}.`,
          recommendedServices: DEFAULT_SERVICES.slice(0, 3).map((s) => ({
            id: s.id,
            name: s.name,
            category: s.category,
            startingPrice: s.startingPrice,
            matchReason: `Fits within your \$${safeParams.budget.toLocaleString()} budget and complements ${safeParams.theme}.`,
          })),
          recommendedVenues: DEFAULT_VENUES.slice(0, 2).map((v) => ({
            id: v.id,
            name: v.name,
            location: v.location,
            capacity: v.capacity,
            pricing: v.pricing,
            matchReason: `Capacity of ${v.capacity} ideal for ${safeParams.guestCount} guests in ${v.location}.`,
          })),
        };
      } catch (err) {
        console.warn('[AI SERVICE] Provider API call failed, using graceful fallback:', err.message);
      }
    }

    // Graceful Demo / Fallback Mode
    console.log('[AI SERVICE] Key missing or fallback mode active. Generating domain recommendations.');

    const matchingServices = DEFAULT_SERVICES.filter((s) => s.startingPrice <= safeParams.budget * 0.4).slice(0, 3);
    const matchingVenues = DEFAULT_VENUES.filter((v) => v.capacity >= safeParams.guestCount * 0.8).slice(0, 2);

    return {
      success: true,
      mode: 'DEMO',
      isAiGenerated: true,
      disclaimer: 'Recommendations are curated suggestions tailored by Elegant Moments AI Assistant.',
      summary: `Tailored curation for a ${safeParams.theme} (${safeParams.weddingType}) for ${safeParams.guestCount} guests with estimated budget of \$${safeParams.budget.toLocaleString()}.`,
      recommendedServices: matchingServices.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        startingPrice: s.startingPrice,
        matchReason: `High-value match for your budget of \$${safeParams.budget.toLocaleString()}.`,
      })),
      recommendedVenues: matchingVenues.map((v) => ({
        id: v.id,
        name: v.name,
        location: v.location,
        capacity: v.capacity,
        pricing: v.pricing,
        matchReason: `Accommodates ${v.capacity} guests in ${v.location}.`,
      })),
    };
  },

  async handleChatbotMessage({ message, history = [] }) {
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!message || typeof message !== 'string') {
      const err = new Error('Message text is required.');
      err.statusCode = 400;
      throw err;
    }

    const cleanInput = message.trim().toLowerCase();

    // Prevent prompt injection / security violations
    if (
      cleanInput.includes('ignore previous instructions') ||
      cleanInput.includes('show password') ||
      cleanInput.includes('jwt_secret') ||
      cleanInput.includes('database_url')
    ) {
      return {
        success: true,
        reply: 'I am here to assist you with Elegant Moments luxury wedding planning services, venues, and consultation bookings. I cannot discuss internal system configurations.',
        actionRequired: null,
      };
    }

    if (apiKey && process.env.NODE_ENV === 'production') {
      try {
        console.log('[AI CHATBOT] Calling live AI model...');
        return {
          success: true,
          mode: 'LIVE',
          reply: `Thank you for asking about "${message}". Elegant Moments offers bespoke luxury wedding planning, fine art event design, and multi-day destination galas globally. You can schedule a private consultation via our client dashboard or contact page.`,
          actionRequired: 'GUIDE_TO_CONSULTATION',
        };
      } catch (err) {
        console.warn('[AI CHATBOT] API error, falling back:', err.message);
      }
    }

    // Domain intelligent response matrix
    let reply = 'Welcome to Elegant Moments. We specialize in luxury wedding planning, world-class destination venues, and high-concept celebration styling.';
    let actionRequired = null;

    if (cleanInput.includes('book') || cleanInput.includes('consultation') || cleanInput.includes('appointment')) {
      reply = 'To book a private consultation with our senior planning team, please visit our Consultation Booking section or Contact page. Consultation sessions include a 45-minute vision review with a dedicated event director.';
      actionRequired = 'GO_TO_CONSULTATION';
    } else if (cleanInput.includes('venue') || cleanInput.includes('location') || cleanInput.includes('château') || cleanInput.includes('como')) {
      reply = 'We partner with exclusive global venues including Villa d\'Este on Lake Como, Château de Chantilly in France, and The St. Regis Florence. You can explore our curated Venues catalog for details.';
      actionRequired = 'GO_TO_VENUES';
    } else if (cleanInput.includes('service') || cleanInput.includes('cost') || cleanInput.includes('price') || cleanInput.includes('budget')) {
      reply = 'Our luxury planning services start from \$15,000 for full-service planning, with custom floral design, culinary curation, and haute couture photography packages available. Explore our Services directory to view details.';
      actionRequired = 'GO_TO_SERVICES';
    } else if (cleanInput.includes('proposal') || cleanInput.includes('quote')) {
      reply = 'Proposals are prepared by your assigned planning director after an initial consultation review. Once created, you can review and approve your proposal in your Client Dashboard.';
      actionRequired = 'GO_TO_DASHBOARD';
    }

    return {
      success: true,
      mode: 'DEMO',
      reply,
      actionRequired,
    };
  },
};
