
import { IndustryBenchmark, BlogPost, BlogComment } from './types';

export const COLORS = {
  primary: '#ffffff',
  secondary: '#1d4ed8', 
  accent: '#e11d48',    
  text: '#0f172a',
  textMuted: '#64748b',
  background: '#ffffff',
  surface: '#f8fafc',
};

// Reordered links to match the site flow
export const NAVIGATION_LINKS = [
  { name: 'Home', href: '#home', view: 'home' },
  { name: 'Services', href: '#services', view: 'services' },
  { name: 'Products', href: '#products', view: 'products' },
  { name: 'Solutions', href: '#solutions', view: 'solutions' },
  { name: 'Intelligence Lab', href: '#lab', view: 'lab' },
  { name: 'Research Blog', href: '#blog', view: 'blog' },
  { name: 'Discovery', href: '#discovery', view: 'discovery' },
  { name: 'CMS Admin', href: '#cms', view: 'cms' },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'grid-reliability',
    title: "Grid Reliability & Solar Adoption in Kenyan Urban Centers",
    tag: "RESEARCH",
    date: "MAR 12, 2025",
    readTime: "4 min read",
    author: "Wanjiku Mwangi, Solar Market Analyst",
    summary: "Analyzing how grid instability in Nairobi and Mombasa is accelerating the shift to high-capacity battery storage systems and hybrid backup solutions.",
    img: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=800",
    fullContent: [
      "Urban commercial centers in Nairobi, Mombasa, and Kisumu are facing increasing sensitivity to utility power fluctuations, driving commercial and residential clients toward hybrid solar systems.",
      "Rather than purely measuring grid kilowatt-hour replacement, purchasing decisions are heavily anchored in business continuity, sensitive equipment protection, and zero-flicker generator replacement.",
      "High-capacity Lithium Iron Phosphate (LiFePO4) storage integration has surpassed 60% of all new urban EPC quotes in Q1 2025."
    ]
  },
  {
    id: 'rural-adoption',
    title: "Messaging for Rural Adoption: Lessons from Off-Grid Deployments",
    tag: "STRATEGY",
    date: "MAR 05, 2025",
    readTime: "5 min read",
    author: "Samuel Njoroge, Decentralized Energy Specialist",
    summary: "Examining the cultural and economic factors driving community-led clean energy transitions in decentralized agricultural markets across East Africa.",
    img: "https://images.unsplash.com/photo-1542332213-9b5a5a3fab35?q=80&w=800",
    fullContent: [
      "Decentralized solar marketing in rural East Africa requires moving beyond abstract environmental appeals to direct economic enablement metrics.",
      "Agri-solar campaigns highlighting irrigation reliability, cold-chain milk preservation, and milling power show a 3.2x higher conversion rate than general electrification ads.",
      "Seamless integration with mobile money escrow and flexible seasonal payment schedules remains the strongest trust catalyst."
    ]
  },
  {
    id: 'epc-benchmarks',
    title: "The 2025 Kenyan EPC Performance Benchmark Report",
    tag: "MARKET DATA",
    date: "FEB 24, 2025",
    readTime: "6 min read",
    author: "Kevin Mutua, Research Director",
    summary: "An exhaustive study of lead acquisition costs and sales velocity across 45 major solar contractors in the region.",
    img: "https://images.unsplash.com/photo-1466611653911-95282fc365d5?q=80&w=800",
    fullContent: [
      "Our survey of 45 solar engineering, procurement, and construction (EPC) firms across Kenya reveals an average Customer Acquisition Cost (CAC) of KES 55,000 for C&I projects.",
      "Firms utilizing transparent online quotation calculators and educational video teardowns shortened their average proposal-to-contract cycle from 84 days down to 38 days.",
      "Referral marketing combined with automated post-commissioning performance digests yielded the lowest overall blended acquisition cost."
    ]
  },
  {
    id: 'commercial-scale',
    title: "Commercial Scale Solar: Financing as a Marketing Lever",
    tag: "FINANCE",
    date: "FEB 18, 2025",
    readTime: "5 min read",
    author: "Beatrice Wanjala, Energy Finance Partner",
    summary: "How C&I installers are using flexible credit terms and PPA models to shorten the B2B sales cycle for manufacturing clients.",
    img: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=800",
    fullContent: [
      "High upfront capital expenditure remains the primary objection among medium-sized manufacturers looking to install rooftop arrays over 100kWp.",
      "Installers packaging Power Purchase Agreements (PPAs) and lease-to-own financing directly into their initial pitch deck achieve a 68% increase in executive meeting conversions.",
      "Key financing partners are increasingly accepting verifiable solar generation telemetry as performance collateral."
    ]
  }
];

export const INITIAL_BLOG_COMMENTS: BlogComment[] = [
  {
    id: 'comm-1',
    postId: 'grid-reliability',
    authorName: 'John K. Mwangi',
    authorRole: 'Lead Engineer, Solarium East Africa',
    content: 'In Westlands and Industrial Area, we are seeing clients prioritize 15kWh+ LiFePO4 battery banks over expanding panel arrays. The ROI argument is now built around business uptime during blackouts rather than just tariff savings.',
    category: 'thought',
    createdAt: '2025-03-13T10:30:00Z',
    likes: 8,
    isLiked: false
  },
  {
    id: 'comm-2',
    postId: 'grid-reliability',
    authorName: 'Mary Otieno',
    authorRole: 'Energy Consultant, GreenPower Advisory',
    content: 'How are contractors factoring the latest EPRA commercial tariff adjustments into their payback models? Are clients seeking Net Metering agreements or pure zero-export hybrid systems?',
    category: 'question',
    createdAt: '2025-03-13T14:15:00Z',
    likes: 5,
    isLiked: false
  },
  {
    id: 'comm-3',
    postId: 'rural-adoption',
    authorName: 'Samuel Njoroge',
    authorRole: 'Off-Grid Project Director',
    content: 'Integrating M-Pesa automated micro-installments has reduced our default rates below 3% in Meru and Embu. Framing solar as productive agricultural equipment rather than just clean energy drives immediate conversion.',
    category: 'thought',
    createdAt: '2025-03-07T09:00:00Z',
    likes: 12,
    isLiked: false
  },
  {
    id: 'comm-4',
    postId: 'rural-adoption',
    authorName: 'Aisha Hassan',
    authorRole: 'Agribusiness Development Lead',
    content: 'What warranty structures and local technician response times are proving most critical for building trust among farming cooperatives in decentralized zones?',
    category: 'question',
    createdAt: '2025-03-08T11:45:00Z',
    likes: 6,
    isLiked: false
  },
  {
    id: 'comm-5',
    postId: 'epc-benchmarks',
    authorName: 'Kevin Mutua',
    authorRole: 'Solar Marketing Strategist',
    content: 'The finding about closing deals 40% faster with localized case studies resonates strongly. Kenyan factory owners want to see data from an industrial neighbor in Athi River or Thika, not an abstract case study from Europe.',
    category: 'thought',
    createdAt: '2025-02-26T16:20:00Z',
    likes: 15,
    isLiked: false
  },
  {
    id: 'comm-6',
    postId: 'epc-benchmarks',
    authorName: 'David Rotich',
    authorRole: 'Operations Manager, Rift Solar',
    content: 'Are the lead acquisition CAC benchmarks measured purely on digital ad spend, or do they include localized field activations and referral fees?',
    category: 'question',
    createdAt: '2025-02-27T08:10:00Z',
    likes: 4,
    isLiked: false
  },
  {
    id: 'comm-7',
    postId: 'commercial-scale',
    authorName: 'Beatrice Wanjala',
    authorRole: 'Climate Finance Analyst',
    content: 'Power Purchase Agreements (PPAs) with zero upfront CapEx are opening doors for tier-2 food processing plants that previously had their capital locked in working inventory.',
    category: 'thought',
    createdAt: '2025-02-19T13:40:00Z',
    likes: 9,
    isLiked: false
  },
  {
    id: 'comm-8',
    postId: 'commercial-scale',
    authorName: 'Collins Maina',
    authorRole: 'C&I Project Developer',
    content: 'What are the main collateral requirements Kenyan commercial banks are asking for when approving credit for 200kWp+ rooftop installations?',
    category: 'question',
    createdAt: '2025-02-20T15:05:00Z',
    likes: 7,
    isLiked: false
  }
];

export const STANDARDIZED_PRODUCTS = [
  {
    id: 'blueprint',
    title: 'The Solar Growth Blueprint',
    subtitle: 'Strategic Performance Audit',
    deliverable: '40-Page Customized Roadmap PDF',
    price: '45,000',
    currency: 'KES',
    description: 'A comprehensive, data-backed diagnostic of your current sales funnel, messaging architecture, and market positioning.',
    features: [
      'Competitor Benchmarking (Top 5 Kenyan EPCs)',
      'High-Intent Keyword Map for Solar',
      'Conversion Rate Optimization (CRO) Audit',
      '3-Month Scalable Ad-Spend Roadmap',
      'Bonus: 60-Minute Executive Strategy Call'
    ],
    timeToDelivery: '7 Business Days',
    isPopular: true
  },
  {
    id: 'creative-kit',
    title: 'Solar Creative Accelerator',
    subtitle: 'Asset Production Pack',
    deliverable: 'Optimized High-Performance Ad Assets',
    price: '120,000',
    currency: 'KES',
    description: 'Stop testing mediocre ads. Get a standardized pack of high-converting visual assets designed specifically for the solar sector.',
    features: [
      '3 High-Production Short-Form Videos',
      '10 Static Direct-Response Graphics',
      'Multi-Channel Copywriting Scripts',
      'Landing Page UX Wireframe',
      'Technical Specs for Radio/OOH'
    ],
    timeToDelivery: '14 Business Days',
    isPopular: false
  }
];

export const INDUSTRY_BENCHMARKS: Record<string, IndustryBenchmark> = {
  'Home Solar (B2C)': { 
    avgConvRate: 3.5, 
    targetCAC: 12000, 
    valueMetric: 'Cost per Install',
    description: 'Residential rooftop solar and battery backup solutions.'
  },
  'Commercial Solar (C&I)': { 
    avgConvRate: 1.2, 
    targetCAC: 55000, 
    valueMetric: 'Pipeline Value',
    description: 'Energy solutions for schools, churches, and agri-businesses.'
  },
  'Mini-Grid Operators': { 
    avgConvRate: 0.8, 
    targetCAC: 85000, 
    valueMetric: 'Dignity connections',
    description: 'Rural electrification and community power systems.'
  },
  'Solar SaaS & Tech': { 
    avgConvRate: 2.1, 
    targetCAC: 9500, 
    valueMetric: 'LTV : CAC Ratio',
    description: 'Design tools and CRM for Kenyan EPCs.'
  }
};

export const SERVICES = [
  {
    category: "GROWTH ENGINEERING",
    items: [
      "High-Intent Paid Acquisition",
      "Localized Lead Capture Funnels",
      "Predictive Retargeting",
      "Direct-Response Ecosystems",
      "Multi-Channel Dominance",
      "Video Content Syndication"
    ]
  },
  {
    category: "MARKET INFRASTRUCTURE",
    items: [
      "Technical SEO & EPC Visibility",
      "High-Authority Copywriting",
      "Conversion Optimization",
      "Behavioral Frameworks",
      "Revenue-Marketing Ops",
      "LTV Growth Modeling"
    ]
  },
  {
    category: "INSTITUTIONAL CREATIVE",
    items: [
      "Market Positioning",
      "Interface Design",
      "Founder-Led Campaigns",
      "Impact Documentaries",
      "Trust-Building Protocols"
    ]
  }
];

export const PRICING_BUNDLES = [
  {
    name: 'Starter',
    description: 'For early-stage solar innovators seeking market validation and lean lead generation.',
    price: '74,100',
    vat: 'KES/one-time',
    timeline: '4 weeks',
    features: [
      'Strategic Clarity Diagnostic',
      'Messaging Framework',
      'Optimized Landing Page',
      'Lead Nurture Protocol',
      'Growth Stack Deployment'
    ],
    note: 'Best for pilot programs.'
  },
  {
    name: 'Prime Ignite',
    description: 'For established brands seeking to scale revenue and stabilize consistent lead flow.',
    price: '284,200',
    vat: 'KES/mo',
    timeline: '3-mo min',
    featured: true,
    features: [
      'Full-Funnel Optimization',
      'Multi-Channel Engines',
      'Enterprise Automation',
      'Data-Driven Roadmapping',
      'Bi-Weekly Growth Sprints'
    ],
    note: 'Our most requested partnership.'
  },
  {
    name: 'Institutional',
    description: 'Fractional CMO engagement for regional operators requiring high-level strategic oversight.',
    price: 'Custom',
    vat: 'Partner Tier',
    timeline: '6-12 months',
    features: [
      'Fractional CMO Stewardship',
      'Annual Market Roadmap',
      'Multi-Market Dominance',
      'Advanced Predictive Analytics',
      'Executive Priority Delivery'
    ],
    note: 'Deep long-term integration.'
  }
];

export const TESTIMONIALS_DATA = [
  {
    text: "We had a great product but zero brand presence. NuruGrowth built us a clear messaging strategy and a high-converting website. In 3 months, our qualified leads doubled.",
    author: "Brian O.",
    role: "Founder, SunAfya Energy"
  },
  {
    text: "Our social media was all tech specs—no emotion. NuruGrowth repositioned us around ‘energy dignity’. Our Instagram now drives 60% of new dealer inquiries.",
    author: "Zawadi A.",
    role: "Growth Lead, Pwani Solar Solutions"
  },
  {
    text: "We were stuck pitching only to NGOs. NuruGrowth helped us craft offers for schools and agri-businesses. Revenue grew by 150% in 5 months.",
    author: "Daniel M.",
    role: "CEO, Lake Region Power"
  }
];

export const INDUSTRIES = Object.keys(INDUSTRY_BENCHMARKS);
