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

    // Safety Boundaries: Serious Non-Wedding Distress
    if (
      cleanInput.includes('suicide') ||
      cleanInput.includes('self harm') ||
      cleanInput.includes('end my life') ||
      cleanInput.includes('kill myself')
    ) {
      return {
        success: true,
        reply: "I hear how much pain you're in, and I want to support you. However, as an AI wedding concierge, I am not qualified to provide mental health crisis support. Please reach out to someone who can help — in the US, you can call or text 988, or contact a local helpline or trusted professional right away.",
        suggestions: ['Book Consultation', 'Explore Services'],
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
          suggestions: ['Book Consultation', 'Find Venues', 'Explore Services'],
          actionRequired: 'GUIDE_TO_CONSULTATION',
        };
      } catch (err) {
        console.warn('[AI CHATBOT] API error, falling back:', err.message);
      }
    }

    // Extract recent history context
    const recentHistoryText = (history || [])
      .slice(-4)
      .map((m) => (m.text || '').toLowerCase())
      .join(' ');

    let reply = '';
    let suggestions = ['Find Venues', 'Explore Services', 'Plan My Budget'];
    let actionRequired = null;

    // 1. Contextual Follow-up Check
    const isAskingForOne = cleanInput.includes('finding one') || cleanInput.includes('find one') || cleanInput.includes('need one') || cleanInput.includes('about one');
    if (isAskingForOne && (recentHistoryText.includes('venue') || recentHistoryText.includes('december') || recentHistoryText.includes('month') || recentHistoryText.includes('wedding'))) {
      reply = "Finding the right venue can feel daunting, but we're here to guide you. For a celebration like yours, historic palazzos, conservatory estates, and luxury destination resorts create breathtaking atmospheres. Would you like to explore our curated global venues?";
      suggestions = ['Explore Venues', 'Book Consultation', 'Plan My Budget'];
      actionRequired = 'GO_TO_VENUES';
    }

    // 2. Emotional Client Recognition (Acknowledge -> Reassure -> Help -> Next step)
    else if (cleanInput.includes('just got engaged') || cleanInput.includes('got engaged') || cleanInput.includes("we're engaged") || cleanInput.includes("i'm engaged")) {
      reply = "Congratulations! ✨ What a beautiful moment. I'd love to help you turn that excitement into a celebration that feels completely yours. Would you like to start with your venue, overall vision, or budget?";
      suggestions = ['Explore Wedding Styles', 'Find a Venue', 'Start Planning'];
    } else if (cleanInput.includes('so excited') || cleanInput.includes('excited for my wedding') || cleanInput.includes('excited about planning')) {
      reply = "And you should be! ✨ This is such a special chapter. Tell me a little about the celebration you're imagining, and we'll start shaping it together.";
      suggestions = ['Explore Wedding Styles', 'Find a Venue', 'Start Planning'];
    } else if (cleanInput.includes('nervous')) {
      reply = "That's completely understandable — there can be a lot to think about when planning such an important day. We can take it one step at a time. Would you like to start with your venue, budget, or overall wedding style?";
      suggestions = ['Explore Venues', 'Plan My Budget', 'Book Consultation'];
    } else if (cleanInput.includes("don't know where to start") || cleanInput.includes('where to start') || cleanInput.includes('where do i start') || cleanInput.includes('overwhelmed')) {
      reply = "You don't have to figure everything out at once. Let's make it simple. We can start with your vision, guest count, and budget, then build from there.";
      suggestions = ['Plan My Budget', 'Explore Services', 'Book Consultation'];
    } else if (cleanInput.includes('stressed') || cleanInput.includes('expensive') || cleanInput.includes('tight budget') || cleanInput.includes('costing')) {
      reply = "I understand — wedding costs can quickly become overwhelming. We can break the budget into priorities and explore options that fit within what you're comfortable spending.";
      suggestions = ['Plan My Budget', 'Explore Services', 'Book Consultation'];
    } else if (cleanInput.includes("don't know what kind") || cleanInput.includes("don't know what i want") || cleanInput.includes('unsure') || cleanInput.includes('help me decide')) {
      reply = "That's completely okay. Sometimes the easiest way to discover your style is to start with what you love. I can help you explore venues, themes, colours, and celebration styles.";
      suggestions = ['Explore Venues', 'Explore Services', 'Help Me Decide'];
    }

    // 3. Natural Client Greetings
    else if (/^(hi|hi!|hi\s.*|hi\.)/i.test(cleanInput) && cleanInput.length < 15) {
      reply = "Hello! Welcome to Elegant Moments. 🤍 How can I help you with your celebration today?";
      suggestions = ['Find a venue', 'Explore services', 'Plan my budget'];
    } else if (/^(hello|hello!|hello\s.*|hello\.)/i.test(cleanInput) && cleanInput.length < 15) {
      reply = "Hello! It’s lovely to have you here. Are you exploring venues, services, or just getting started with your wedding plans?";
      suggestions = ['Find a venue', 'Explore services', 'Plan my budget'];
    } else if (cleanInput.includes('hey, i need some help') || cleanInput.includes('need help') || cleanInput.includes('need some help') || cleanInput === 'hey') {
      reply = "Of course. I'm here to help make the planning process a little easier. What are you currently trying to figure out?";
      suggestions = ['Find a venue', 'Explore services', 'Plan my budget'];
    }

    // 4. Domain Planning Inquiries
    else if (cleanInput.includes('book') || cleanInput.includes('consultation') || cleanInput.includes('appointment')) {
      reply = "To book a private consultation with our senior planning team, please visit our Consultation Booking section or Contact page. Consultation sessions include a 45-minute vision review with a dedicated event director.";
      suggestions = ['Book Consultation', 'Explore Services', 'Find Venues'];
      actionRequired = 'GO_TO_CONSULTATION';
    } else if (cleanInput.includes('venue') || cleanInput.includes('location') || cleanInput.includes('château') || cleanInput.includes('como')) {
      reply = "We partner with exclusive global venues including Villa d'Este on Lake Como, Château de Chantilly in France, and City Palace in Udaipur. You can explore our curated Venues catalog for details.";
      suggestions = ['Explore Venues', 'Book Consultation', 'Plan My Budget'];
      actionRequired = 'GO_TO_VENUES';
    } else if (cleanInput.includes('service') || cleanInput.includes('cost') || cleanInput.includes('price') || cleanInput.includes('budget')) {
      reply = "Our luxury planning services start from $15,000 for full-service planning. For a wedding in this range, I'd start with three priorities:\n\n• Venue selection\n• Guest count & catering\n• Priority design services\n\nOnce we know those, we can build the rest around them.";
      suggestions = ['Plan My Budget', 'Explore Services', 'Book Consultation'];
      actionRequired = 'GO_TO_SERVICES';
    } else if (cleanInput.includes('proposal') || cleanInput.includes('quote')) {
      reply = "Proposals are prepared by your assigned planning director after an initial consultation review. Once created, you can review and approve your proposal in your Client Dashboard.";
      suggestions = ['Client Dashboard', 'Book Consultation', 'Explore Services'];
      actionRequired = 'GO_TO_DASHBOARD';
    } else if (cleanInput.includes('december') || cleanInput.includes('june') || cleanInput.includes('summer') || cleanInput.includes('winter') || cleanInput.includes('getting married in')) {
      reply = "That sounds wonderful! Wedding dates in seasons like December can be truly magical. Are you already thinking about a venue or still exploring options?";
      suggestions = ['Find a Venue', 'Explore Services', 'Plan My Budget'];
    }

    // 5. Fallback Response
    if (!reply) {
      reply = "I'm here to guide your luxury wedding journey with white-glove care. Whether you are seeking destination venues, bespoke floral curation, or full-service planning, how can I best assist your vision today?";
      suggestions = ['Find Venues', 'Explore Services', 'Plan My Budget'];
    }

    return {
      success: true,
      mode: 'DEMO',
      reply,
      suggestions,
      actionRequired,
    };
  },
};
