
export interface AnalysisInput {
  industry: string;
  monthlyRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  adSpend: number;
  traffic: number;
  ltv: number;
  email?: string;
}

export interface IndustryBenchmark {
  avgConvRate: number;
  targetCAC: number;
  valueMetric: string;
  description: string;
}

export interface AnalysisResults {
  industry: string;
  industryValueMetric: string;
  traffic: number;
  currentCAC: number;
  projectedRevenue: number;
  efficiencyGain: number;
  growthPercentage: number;
  optimizedCAC: number;
  valueGap: number;
  healthScore: number;
  benchmarkConvRate: number;
  benchmarkCAC: number;
  isHighPerformer: boolean;
  dataPoints: {
    name: string;
    current: number;
    benchmark: number;
    optimized: number;
    unit?: string;
  }[];
  budgetAllocation: {
    name: string;
    value: number;
    color: string;
  }[];
}

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  createdAt?: string;
  lastLogin?: string;
  accessKey?: string;
}

export type CommentCategory = 'thought' | 'question' | 'general';

export interface BlogComment {
  id: string;
  postId: string;
  authorName: string;
  authorRole?: string;
  content: string;
  category: CommentCategory;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

export type BlogPostStatus = 'published' | 'draft';

export interface BlogPost {
  id: string;
  title: string;
  tag: string;
  date: string;
  summary: string;
  img: string;
  readTime?: string;
  author?: string;
  authorRole?: string;
  slug?: string;
  fullContent?: string[];
  status?: BlogPostStatus;
  featured?: boolean;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
  format?: string; // 'standard' | 'case-study' | 'brief' | 'technical'
  scheduledFor?: string; // ISO date string
}

export type QuoteStatus = 'new' | 'in_review' | 'contacted' | 'proposal_sent' | 'won' | 'archived';

export interface QuoteRequest {
  id: string;
  companyName: string;
  website?: string;
  country: string;
  targetSegment: string;
  productPackage?: string;
  systemCapacityKWp?: string;
  monthlyAcquisitionGoal?: string;
  currentAdSpend?: string;
  painPoints: string[];
  customNotes?: string;
  contactName: string;
  contactRole?: string;
  email: string;
  phone: string;
  preferredSchedule?: string;
  status: QuoteStatus;
  adminNotes?: string;
  createdAt: string;
}

export type EmailSubscriberSource = 'growth_lab' | 'quote_onboarding' | 'newsletter_footer' | 'contact_direct';

export interface EmailSubscriber {
  id: string;
  email: string;
  name?: string;
  companyName?: string;
  source: EmailSubscriberSource;
  sourceLabel: string;
  country?: string;
  welcomeEmailSent: boolean;
  welcomeEmailSentAt?: string;
  welcomeEmailSubject?: string;
  welcomeEmailBody?: string;
  createdAt: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

export interface CustomSocialLink {
  platformName: string;
  url: string;
}

export interface PricingBundle {
  name: string;
  description: string;
  price: string;
  vat: string;
  timeline: string;
  features: string[];
  note?: string;
  featured?: boolean;
}

export interface ProductizedOffer {
  id: string;
  title: string;
  subtitle: string;
  deliverable: string;
  price: string;
  currency: string;
  description: string;
  features: string[];
  timeToDelivery: string;
  isPopular?: boolean;
}

export interface SiteSettings {
  id: string; // typically 'main'
  linkedinUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  xUrl: string;
  whatsappUrl: string;
  inquiriesEmail: string;
  operationalBase: string;
  footerText: string;
  updatedAt: string;
  customSocialLinks?: CustomSocialLink[];
  
  // Hero section customizable fields
  heroEyebrow?: string;
  heroTitle?: string;
  heroSubtext?: string;
  heroPrimaryBtnText?: string;
  heroPrimaryBtnUrl?: string;
  heroSecondaryBtnText?: string;
  heroSecondaryBtnUrl?: string;

  // Solutions customization
  pricingBundles?: PricingBundle[];
  productizedOffers?: ProductizedOffer[];
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export interface AppReview {
  id: string;
  authorName: string;
  authorRole: string; // e.g., CEO, Developer
  companyName: string;
  rating: number; // 1-5
  content: string;
  mediaUrl?: string; // Optional image/video base64 or link
  mediaType?: 'image' | 'video';
  status: ReviewStatus;
  createdAt: string;
  verifiedInteraction: boolean; // Must be true to submit
}

export interface CMSCredential {
  id: string;
  fullName: string;
  title: string;
  email: string;
  passwordHash: string; // Stored securely as SHA-256 hash
  role: 'viewer' | 'editor' | 'admin';
  accessKey: string; // Hashed security key
  status: 'Active' | 'Disabled';
  expiresAt: string; // Date string
  createdAt: string;
  failedLogins: number;
  lockedUntil: string | null; // Lockout timestamp string
}

export interface CMSAuditLog {
  id: string;
  timestamp: string;
  action: string;
  operatorEmail: string;
  targetEmail: string;
  details: string;
}

