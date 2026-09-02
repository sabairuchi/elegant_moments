// Elegant Moments Data Architecture (Milestone 1)

export const BRAND = {
  name: "Elegant Moments",
  logo: "/logo.png",
  logoTransparent: "/logo-transparent.png",
  logoEmblem: "/logo-emblem.png",
  tagline: "Where Moments Become Memories.",
  subtext: "Luxury wedding and event experiences crafted around your story, style and vision.",
  address: "740 Park Avenue, Suite 1800, New York & Via Montenapoleone 8, Milan",
  phone: "+1 (800) 789-9821",
  email: "concierge@elegantmoments.com",
  instagram: "@elegantmoments_events",
  pinterest: "pinterest.com/elegantmoments",
};

export const CINEMATIC_VIDEOS = {
  hero: "https://www.pexels.com/download/video/28952503/",
  heroFallback: "https://videos.pexels.com/video-files/28952503/28952503-hd_1920_1080_30fps.mp4",
  lakeComo: "https://www.pexels.com/download/video/31252871/",
  lakeComoFallback: "https://videos.pexels.com/video-files/31252871/31252871-hd_1920_1080_30fps.mp4",
  destination: "https://assets.mixkit.co/videos/preview/mixkit-romantic-couple-on-a-beach-at-sunset-41601-large.mp4",
  decor: "https://assets.mixkit.co/videos/preview/mixkit-wedding-table-setting-with-candles-and-flowers-41607-large.mp4"
};

export const SERVICES = [
  {
    id: "luxury-wedding-planning",
    title: "Luxury Wedding Planning",
    subtitle: "End-to-End Orchestration of Extraordinary Celebrations",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    summary: "Comprehensive, bespoke wedding planning that transforms your loftiest dreams into an effortlessly flawless celebration.",
    description: "Our full-service luxury wedding planning is designed for couples who demand perfection, privacy, and impeccable execution. From initial architectural concepts to vendor curation, budget strategy, design blueprints, and multi-day itinerary management, every single detail is handled with white-glove precision.",
    features: [
      "Dedicated Senior Event Producer & Creative Director",
      "Bespoke Visual Concept & Architectural Styling Blueprints",
      "Exclusive Access to Tier-1 International Artisans & Florists",
      "Full Financial Strategy & Line-Item Budget Management",
      "Guest Concierge & VIP Logistics Coordination",
      "Comprehensive Multi-Day Wedding Weekend Orchestration"
    ]
  },
  {
    id: "destination-weddings",
    title: "Destination Weddings",
    subtitle: "Worldwide Celebrations in Iconic & Private Locales",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
    summary: "Seamless multi-day destination celebrations hosted in private villas, historic châteaux, and island retreats globally.",
    description: "Whether exchanging vows on a clifftop in Ravello, a historic palace in Rajasthan, or a private island in the Caribbean, our global production team handles international customs, local vendor management, guest travel logistics, welcome galas, and post-wedding brunches seamlessly.",
    features: [
      "Global Venue Scouting & Private Land Ownership Liaison",
      "International Logistics & Charter Flight Management",
      "Multilingual On-Site Event Crews & Production Teams",
      "Local Culinary & Master Sommelier Curation",
      "Cultural & Heritage Protocol Advisory",
      "Pre & Post Wedding Host Experiences"
    ]
  },
  {
    id: "private-celebrations",
    title: "Private Celebrations",
    subtitle: "Milestone Anniversaries, Galas & Bespoke Parties",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80",
    summary: "High-concept private galas, milestone birthdays, and exclusive anniversary celebrations tailored with theatrical elegance.",
    description: "We bring the same editorial storytelling and haute-couture production standards to private celebrations, milestone anniversaries, vow renewals, and luxury galas. Every gathering is infused with custom entertainment, immersive dining, and sensory art.",
    features: [
      "Custom Spatial & Lighting Scenography",
      "A-List Musical & Performing Artist Booking",
      "Sommelier & Michelin-Star Chef Partnerships",
      "Private Security & VIP Privacy Management",
      "Custom Gifting & Bespoke Favors"
    ]
  },
  {
    id: "event-design-styling",
    title: "Event Design & Styling",
    subtitle: "Visual Storytelling, Florals & Spatial Scenography",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    summary: "Artistic direction, custom floral installations, custom linen, lighting design, and tactile tabletop curation.",
    description: "Our dedicated creative studio designs immersive visual worlds. We transform raw spaces using sculptural floral installations, bespoke table linens, custom stationery typography, ambient candle scapes, and custom-built architectural structures.",
    features: [
      "3D Spatial Renderings & Moodboard Blueprints",
      "Sculptural Floral Installations & Botanical Artistry",
      "Custom Fine Stationery & Calligraphy Curation",
      "Architectural Lighting & Projection Mapping",
      "Couture Tableware, Linens & Custom Furniture Rental"
    ]
  },
  {
    id: "guest-experience",
    title: "Guest Experience & Hospitality",
    subtitle: "White-Glove Guest Care, Transfers & Curated Activities",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
    summary: "Ensuring every guest feels like a honored dignitary from RSVP tracking to departure gifts.",
    description: "A luxury celebration is defined by how your guests feel. Our dedicated concierge team handles luxury hotel block bookings, private chauffeur transfers, personalized welcome hampers, dietary preference tracking, and curated destination excursions.",
    features: [
      "Dedicated Guest Relations Helpline & Digital Portal",
      "Luxury Hotel Room Block Negotiations",
      "Airport VIP Chauffeur & Private Yacht Transfers",
      "Custom Welcome Gift Curation & Room Placements",
      "Excursion Planning (Wine Tastings, Yacht Cruises)"
    ]
  },
  {
    id: "wedding-day-management",
    title: "Wedding Day Management",
    subtitle: "Flawless Execution for Discerning Hosts",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
    summary: "Precise, calm, and discreet production management on your celebration day.",
    description: "For couples who have curated their own vision but require master-level execution on the day. Our production directors assume control 8 weeks prior to streamline timeline execution, direct vendors, oversee cues, and protect your peace of mind.",
    features: [
      "Master Production Timeline (Minute-by-Minute Cue Sheet)",
      "Lead Producer + 4 Assistant Stage Managers On-Site",
      "Vendor Briefing & Rehearsal Orchestration",
      "Emergency Protocol & Contingency Planning",
      "Discreet Bride & Groom Personal Attendants"
    ]
  },
  {
    id: "hospitality-concierge",
    title: "Hospitality & Concierge",
    subtitle: "Bespoke Lifestyle Services & Private Dining",
    image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
    summary: "Tailored hospitality arrangements for bridal parties, high-profile guests, and private dining events.",
    description: "We extend our luxury services to private bridal brunches, rehearsal dinners, yacht parties, and personal lifestyle requests before and after the main celebration.",
    features: [
      "Private Chef & Sommelier Bookings",
      "Personal Stylist & Hair/Makeup Artistry Curation",
      "Private Jet & Yacht Charters",
      "Honeymoon Suite Curations"
    ]
  }
];

export const EXPERIENCES = [
  {
    id: "royal-weddings",
    title: "Royal & Palace Weddings",
    category: "Grande Scale Heritage",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    tagline: "Opulence rooted in history and grand grandeur.",
    description: "Hosted in European châteaux, Rajasthan palaces, and historic estates, these celebrations feature majestic floral arches, orchestral serenades, and multi-tiered banquets designed for hundreds of esteemed guests."
  },
  {
    id: "destination-celebrations",
    title: "Coastal & Island Escapes",
    category: "Destination Elegance",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
    tagline: "Sun-dappled romance overlooking crystal waters.",
    description: "From cliffside terraces along the Amalfi Coast to private beachfront estates in St. Barths, coastal celebrations embrace natural splendor with refined organic textures and sea breeze hospitality."
  },
  {
    id: "intimate-weddings",
    title: "Intimate Estate Gatherings",
    category: "Exclusive & Meaningful",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
    tagline: "Deep connection in atmosphere of refined luxury.",
    description: "Designed for 20 to 60 cherished guests, intimate celebrations emphasize hyper-personalized dining, bespoke handwritten calligraphy, rare vintage pairings, and warm candlelight."
  },
  {
    id: "garden-celebrations",
    title: "English & Botanical Gardens",
    category: "Editorial Nature",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    tagline: "Poetic florals woven into historic botanical estates.",
    description: "Abundant garden roses, glass conservatory receptions, and cascading greenery create a dreamy sensory journey amidst sprawling manicured hedges and stone fountain courtyards."
  },
  {
    id: "luxury-receptions",
    title: "Haute Couture Receptions",
    category: "Modern Glamour",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80",
    tagline: "Dramatic lighting, custom dance floors & live jazz.",
    description: "High-octane evening receptions featuring mirrored bar installations, custom projection mapping, velvet lounge seating, and performance artists who keep guests enchanted until dawn."
  },
  {
    id: "private-events",
    title: "Vow Renewals & Anniversaries",
    category: "Timeless Legacy",
    image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
    tagline: "Honoring decades of love with artistic flair.",
    description: "Refined anniversary galas and vow renewal banquets held in private art galleries, historic vineyards, or luxury yachts, reaffirming enduring love with elegance."
  }
];

export const VENUES = [
  {
    id: "villa-deste",
    name: "Villa d'Este",
    location: "Lake Como, Italy",
    type: "Historic Renaissance Villa",
    capacity: "Up to 200 Guests",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Nestled on the shores of Lake Como, Villa d'Este is a iconic 16th-century princely residence surrounded by 25 acres of private parkland, centennial trees, and lakeside terraces.",
    highlights: ["Lakeside Ceremony Lawn", "Private Boat Dock", "Michelin Dining", "Helipad Access"]
  },
  {
    id: "chateau-chantilly",
    name: "Château de Chantilly",
    location: "Chantilly, France",
    type: "French Royal Château",
    capacity: "Up to 350 Guests",
    image: "https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "A jewel of French heritage surrounded by vast moats and formal gardens designed by André Le Nôtre. Offers grand ballroom galas and majestic courtyard ceremonies.",
    highlights: ["Historic Art Gallery", "Orangerie Reception Hall", "Fireworks Permitted", "Equestrian Grounds"]
  },
  {
    id: "st-regis-florence",
    name: "The St. Regis Florence",
    location: "Florence, Tuscany, Italy",
    type: "Palazzo Hotel",
    capacity: "Up to 180 Guests",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Designed by Filippo Brunelleschi in the 15th century, this palazzo on the Arno River features Renaissance frescoes, crystal chandeliers, and opulent Salone della Festa.",
    highlights: ["Arno River Views", "Frescoed Ceilings", "St. Regis Butler Service", "Private Wine Cellar"]
  },
  {
    id: "city-palace-udaipur",
    name: "Zenana Mahal, City Palace",
    location: "Udaipur, Rajasthan, India",
    type: "Royal Indian Palace",
    capacity: "Up to 500 Guests",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "An awe-inspiring 17th-century palace courtyard lit by thousands of oil lamps and candles, overlooking Lake Pichola. The pinnacle of regal splendor.",
    highlights: ["Lake Pichola Panorama", "Royal Procession Path", "Carved Marble Pillars", "Live Sitar & Classical Musicians"]
  },
  {
    id: "hotel-caruso-ravello",
    name: "Belmond Hotel Caruso",
    location: "Ravello, Amalfi Coast, Italy",
    type: "Clifftop Palace",
    capacity: "Up to 140 Guests",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Perched 1,000 feet above the Mediterranean, famous for its infinity pool suspended between sea and sky, surrounded by olive groves and rose bowers.",
    highlights: ["Suspended Infinity Pool", "Centennial Rose Gardens", "Private Cliffside Dining", "Panoramic Terraces"]
  },
  {
    id: "the-plaza-ny",
    name: "The Plaza Hotel Grand Ballroom",
    location: "New York City, USA",
    type: "Iconic Manhattan Landmark",
    capacity: "Up to 400 Guests",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "The epitome of Manhattan grandeur. Gilded moldings, white-glove service, and timeless sophistication overlooking Fifth Avenue and Central Park.",
    highlights: ["Central Park South Location", "Gilded 1920s Ballroom", "White Glove Service", "VIP Suites"]
  }
];

export const PORTFOLIO = [
  {
    id: "p1",
    title: "Candlelit Amalfi Reception",
    category: "Receptions",
    location: "Ravello, Italy",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80",
    caption: "A 40-meter banquet table adorned with garden roses and 300 taper candles overlooking the sea."
  },
  {
    id: "p2",
    title: "The Clifftop Vows",
    category: "Ceremonies",
    location: "Santorini, Greece",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80",
    caption: "Minimalist white floral arch framed against the Aegean horizon."
  },
  {
    id: "p3",
    title: "Botanical Glasshouse Table",
    category: "Décor",
    location: "Cotswolds, UK",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80",
    caption: "Wild garden blooms paired with crystal glassware and gold-rimmed porcelain."
  },
  {
    id: "p4",
    title: "Palace Courtyard Serenade",
    category: "Weddings",
    location: "Udaipur, India",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1000&q=80",
    caption: "Marigold cascading mandap with traditional royal musicians."
  },
  {
    id: "p5",
    title: "Monogrammed Silk Details",
    category: "Details",
    location: "Paris, France",
    image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80",
    caption: "Hand-calligraphed velvet place cards sealed with 24k gold leaf."
  },
  {
    id: "p6",
    title: "Private Yacht Sunset Cruise",
    category: "Guest Experiences",
    location: "Capri, Italy",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    caption: "Welcome cocktail cruise for 80 guests around the Faraglioni rocks."
  },
  {
    id: "p7",
    title: "Opulent Château Ballroom",
    category: "Destination",
    location: "Chantilly, France",
    image: "https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=1000&q=80",
    caption: "Midnight dance hall with custom crystal chandeliers and champagne tower."
  },
  {
    id: "p8",
    title: "Couture Bridal Portrait",
    category: "Weddings",
    location: "Florence, Italy",
    image: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=1000&q=80",
    caption: "Editorial moment in a Renaissance palazzo gallery."
  }
];

export const WEDDING_STORIES = [
  {
    id: "story-lake-como",
    title: "A Tuscan & Lake Como Symphony",
    couple: "Victoria & Alexander",
    location: "Villa d'Este, Lake Como",
    type: "3-Day Destination Celebration",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    summary: "An enchanting three-day Italian celebration blending Renaissance poetry, lakeside boat arrivals, and a midnight fireworks display.",
    concept: "Inspired by classical Italian cinema and botanical romance, Victoria and Alexander wanted an effortless luxury weekend that prioritized guest comfort and sensory delight.",
    design: "We transformed the lakeside gardens with 10,000 white garden roses, pale pink ranunculus, and antique brass candelabras. Guests dined under a canopy of fairy lights stretching 50 meters across the lawn.",
    experience: "Guests arrived via private wooden Riva boats to a violin quartet serenading from the terrace. Day two featured an olive oil tasting and vintage convertible rally around the lake.",
    highlights: [
      "Private Riva boat arrival across Lake Como",
      "Custom 7-tier Italian millefeuille cake built live by chef",
      "Midnight fireworks synchronized to live symphony orchestra"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "story-paris-chateau",
    title: "Château de Chantilly Grand Gala",
    couple: "Genevieve & Harrison",
    location: "Chantilly, France",
    type: "Royal Heritage Wedding",
    image: "https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=1200&q=80",
    summary: "Haute-couture Parisian elegance with an outdoor chapel ceremony, opera serenades, and candlelit ballroom dining.",
    concept: "Rooted in 18th-century French romanticism, featuring custom embroidery, gold foil monograms, and Michelin-starred French gastronomy.",
    design: "Burgundy velvet drapes, blush orchids, and crystal tableware created a moody yet timeless aesthetic inside the château's historic gallery.",
    experience: "A 5-course dinner paired with vintage Dom Pérignon, followed by an aerial acrobat show and late-night speakeasy lounge.",
    highlights: [
      "Custom opera aria during the ring exchange",
      "Sommelier-led vintage wine pairings",
      "Speakeasy lounge with custom mixology"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80"
    ]
  }
];

export const JOURNAL_ARTICLES = [
  {
    id: "j1",
    title: "The Art of Multi-Day Destination Hospitality",
    category: "Destination Weddings",
    date: "August 24, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80",
    excerpt: "How to curate a seamless weekend itinerary that balances high elegance with guest relaxation and cultural authenticity.",
    content: `Creating an unforgettable destination wedding is as much about the journey as it is about the main ceremony. When guests travel across continents to celebrate your union, their experience begins the moment they land.

    1. The Art of the Arrival
    Welcome your guests with frictionless transfers. Private chauffeurs equipped with chilled sparkling water and personalized welcome packets sets a tone of thoughtful luxury immediately.

    2. Curating Micro-Moments
    Instead of over-scheduling, curate two major anchored events—a sunlit welcome fiesta or vineyard brunch, followed by a restful morning before the main gala.

    3. Local Authenticity Meets Global Standards
    Incorporate indigenous flavors, local musicians, and native florals while ensuring international production standards for lighting, sound, and comfort.`
  },
  {
    id: "j2",
    title: "Serif & Silk: Editorial Stationary Trends for 2027",
    category: "Planning Guide",
    date: "August 18, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80",
    excerpt: "Exploring handmade deckle-edge paper, blind debossing, and wax seal heraldry that turn invitations into keepsake art.",
    content: `In an era of digital noise, physical invitations have elevated into heirlooms. Tactile typography, heavy cotton rag papers, and custom blind-embossed crests offer guests their first sensory glimpse into your world.`
  },
  {
    id: "j3",
    title: "Lighting Scenography: Transforming Historic Ballrooms",
    category: "Décor",
    date: "August 10, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80",
    excerpt: "Why ambient candle height variations and warm architectural pinpoint lighting are the secret to ethereal photography.",
    content: `Lighting is the silent conductor of emotion. By layering warm amber wash lighting with soft candlelight at three distinct heights, static stone walls come alive with intimate warmth.`
  }
];

export const TEAM_MEMBERS = [
  {
    name: "Genevieve Sterling",
    role: "Founder & Executive Creative Director",
    bio: "Former Parisian haute-couture producer with 15+ years orchestrating high-profile celebrations across Europe and the Americas.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Julian De La Cruz",
    role: "Master Production Architect",
    bio: "Architectural designer specializing in spatial scenography, custom glass structures, and technical staging for complex outdoor estates.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Sophia Montgomery",
    role: "Head of Global Guest Concierge",
    bio: "Former VIP Relations lead at Belmond and St. Regis, managing international logistics, private charters, and dignitary security protocols.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80"
  }
];

export const TESTIMONIALS = [
  {
    quote: "Elegant Moments made our Lake Como wedding feel like a timeless piece of cinema. Every detail was executed with quiet perfection and breathtaking beauty.",
    names: "Victoria & Alexander",
    event: "Destination Wedding at Villa d'Este",
    location: "Lake Como, Italy"
  },
  {
    quote: "From our private jet charters to the midnight opera performance in Paris, Genevieve and her team proved that true luxury lies in absolute care and effortless elegance.",
    names: "Eleanor & Marcus",
    event: "Château Celebration",
    location: "Chantilly, France"
  },
  {
    quote: "The visual design took our breath away. They transformed a historic estate into a candlelit dream garden that our guests are still talking about months later.",
    names: "Sophia & Charles",
    event: "Botanical Garden Gala",
    location: "Cotswolds, United Kingdom"
  }
];
