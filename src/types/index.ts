export type OrderStatus =
  | "new"
  | "brief_received"
  | "in_progress"
  | "in_review"
  | "validated"
  | "delivered"
  | "invoiced"
  | "paid"
  | "cancelled"
  | "refunded"
  | "dispute";

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface ResourceItem {
  id: string;
  type: "transfer_link" | "file" | "url";
  label: string;
  url: string;
  provider?: "wetransfer" | "swisstransfer" | "other";
  createdAt: string;
}
export type InvoiceStatus = "paid" | "pending" | "overdue";
export type SubscriptionStatus = "active" | "cancelled" | "paused";
export type ClientStatus = "active" | "inactive" | "archived";

export interface ClientDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  website: string | null;
  tags: string[];
  notes: string | null;
  totalRevenue: number;
  ordersCount: number;
  status: ClientStatus;
  source: string | null;
  lastOrderAt: string | null;
  createdAt: string;
  avatar: string;
}

export interface ClientNote {
  id: string;
  clientId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientEvent {
  id: string;
  clientId: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface ClientRevenueMonth {
  month: string;
  revenue: number;
  orders: number;
}

export interface LineItem {
  id?: string;
  label: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  productId?: string;
}

export interface Order {
  id: string;
  client: string;
  clientEmail: string;
  clientId?: string;
  clientPhone?: string;
  product: string;
  price: number;
  status: OrderStatus;
  statusId?: string;
  date: string;
  priority: "low" | "normal" | "high" | "urgent";
  deadline?: string;
  paid: boolean;
  tags: string[];
  checklist: ChecklistItem[];
  notes?: string;
  briefing?: string;
  resources?: ResourceItem[];
  category?: string;
  externalRef?: string;
  groupId?: string;
  groupIndex?: number;
  groupTotal?: number;
  customFields?: Record<string, unknown>;
  items?: LineItem[];
  sortPosition?: number;
}

/* ─── Board Config Types (dynamic workflow) ─── */

export type StatusView = "production" | "cash";

export interface BoardStatus {
  id: string;
  slug: string;
  name: string;
  color: string;
  view: StatusView;
  position: number;
  isArchived: boolean;
}

export type BoardFieldType = "text" | "number" | "select" | "multi_select" | "date" | "url" | "money" | "boolean";

export interface FieldOption {
  label: string;
  color: string;
}

export interface BoardField {
  id: string;
  key: string;
  label: string;
  fieldType: BoardFieldType;
  options: FieldOption[];
  isRequired: boolean;
  isVisibleOnCard: boolean;
  isSystem: boolean;
  config: Record<string, unknown>;
  position: number;
}

export interface BoardConfig {
  board: { id: string; name: string };
  statuses: { production: BoardStatus[]; cash: BoardStatus[] };
  fields: BoardField[];
}

export interface Client {
  id: string;
  name: string;
  email: string;
  totalRevenue: number;
  ordersCount: number;
  lastOrder: string;
  avatar: string;
}

export type ProductType = "service" | "pack" | "digital" | "lead_magnet";
export type ProductStatus = "draft" | "active" | "archived";
export type ProductMode = "checkout" | "contact";
export type DeliveryType = "file" | "url" | "message" | "none";

export interface Product {
  id: string;
  name: string;
  priceCents: number;
  status: ProductStatus;
  sales: number;
  category: string;
  type: ProductType;
  slug: string;
  shortDescription: string;
  longDescription?: string;
  features?: string[];
  deliveryTimeDays?: number;
  thumbnailUrl?: string;
  coverImageUrl?: string;
  featured?: boolean;
  mode: ProductMode;
  deliveryType: DeliveryType;
  deliveryFileUrl?: string;
  deliveryUrl?: string;
  ctaLabel: string;
  stripePriceId?: string;
}

/* ─── Projects System ─── */

export type ProjectStatus = "draft" | "in_progress" | "review" | "completed" | "archived";
export type ProjectType = "thumbnail" | "video" | "branding" | "development" | "design" | "content" | "custom";
export type ProjectPriority = "low" | "normal" | "high" | "urgent";
export type ProjectItemType = "folder" | "image" | "video" | "file" | "link" | "note" | "embed" | "reference" | "moodboard";

export interface Project {
  id: string;
  name: string;
  description: string;
  projectType: ProjectType;
  color: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  budget: number;
  currency: string;
  tags: string[];
  coverUrl?: string;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  clientCompany?: string;
  productId?: string;
  orderId?: string;
  isPortfolio: boolean;
  portfolioDescription?: string;
  portfolioDisplayTitle?: string;
  portfolioSubtitle?: string;
  portfolioResult?: string;
  portfolioSummary?: string;
  portfolioCoverUrl?: string;
  portfolioCoverItemId?: string;
  portfolioCategory?: string;
  portfolioImages?: string[];
  portfolioExternalUrl?: string;
  portfolioSlug?: string;
  portfolioCtaLabel?: string;
  portfolioCtaUrl?: string;
  portfolioIntroText?: string;
  portfolioChallengeText?: string;
  portfolioSolutionText?: string;
  portfolioResultText?: string;
  portfolioGalleryItemIds?: string[];
  portfolioSeoTitle?: string;
  portfolioSeoDescription?: string;
  portfolioFeatured?: boolean;
  portfolioDisplayOrder?: number;
  portfolioVisibility?: "draft" | "public";
  shareToken?: string;
  deadline?: string;
  startDate?: string;
  itemsCount: number;
  foldersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFolder {
  id: string;
  projectId: string;
  parentId?: string;
  name: string;
  color: string;
  position: number;
  itemsCount?: number;
}

export interface ProjectItem {
  id: string;
  projectId: string;
  folderId?: string;
  itemType: ProjectItemType;
  title: string;
  description: string;
  content: string;
  url?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  thumbnailUrl?: string;
  tags: string[];
  metadata: Record<string, unknown>;
  position: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: InvoiceStatus;
  date: string;
}

export interface Subscription {
  id: string;
  client: string;
  plan: string;
  amount: number;
  status: SubscriptionStatus;
  startDate: string;
  nextBilling: string;
}

export interface Activity {
  id: number;
  type: string;
  message: string;
  time: string;
}

/* ─── Billing System Types ─── */

export type BillingItemStatus = "draft" | "to_validate" | "validated" | "ready" | "exported" | "invoiced" | "paid" | "cancelled";
export type BillingItemSource = "manual" | "order" | "task" | "template" | "recurring";

export interface BillingItem {
  id: string;
  clientId: string | null;
  clientName?: string;
  orderId: string | null;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  currency: string;
  taxRate: number;
  taxAmount: number;
  totalTtc: number;
  status: BillingItemStatus;
  performedAt: string | null;
  deliveredAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  source: BillingItemSource;
  tags: string[];
  notes: string;
  recurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BillingExportStatus = "completed" | "failed" | "archived";

export interface BillingExport {
  id: string;
  label: string;
  format: "pdf" | "csv" | "excel" | "json";
  periodStart: string | null;
  periodEnd: string | null;
  totalHt: number;
  totalTva: number;
  totalTtc: number;
  itemCount: number;
  clientCount: number;
  filename: string | null;
  fileUrl: string | null;
  status: BillingExportStatus;
  notes: string;
  createdAt: string;
}

export type PeriodClosureStatus = "closed" | "reopened";

export interface PeriodClosure {
  id: string;
  periodYear: number;
  periodMonth: number;
  periodLabel: string;
  totalHt: number;
  totalTva: number;
  totalTtc: number;
  itemCount: number;
  clientCount: number;
  snapshot: {
    drafts: number;
    to_validate: number;
    validated: number;
    ready: number;
    exported: number;
    invoiced: number;
    cancelled: number;
    health_score: number;
    anomaly_count: number;
    top_clients: { id: string; name: string; total_ht: number }[];
    categories: { name: string; total_ht: number }[];
    export_ids: string[];
  };
  status: PeriodClosureStatus;
  closedAt: string;
  reopenedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BillingTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  currency: string;
  taxRate: number;
  tags: string[];
  sortOrder: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RecurringStatus = "active" | "paused" | "ended";

export interface RecurringProfile {
  id: string;
  clientId: string | null;
  clientName?: string;
  templateId: string | null;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  currency: string;
  taxRate: number;
  tags: string[];
  frequency: "monthly";
  genDay: number;
  autoGenerate: boolean;
  status: RecurringStatus;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

/* ─── Site Builder Types ─── */

export type LinkType = "none" | "internal_page" | "external_url" | "product" | "anchor";

export interface Link {
  type: LinkType;
  value: string;
}

/* ─── BlockLink (unified link system) ─── */

export type BlockLinkType = "none" | "internal" | "external" | "product";

export type BlockLink =
  | { type: "none" }
  | { type: "internal"; pageId: string; anchor?: string }
  | { type: "external"; url: string; newTab: boolean }
  | { type: "product"; productId: string; mode: "page" | "checkout"; briefTemplateId?: string };

export interface ButtonStyle {
  bg?: string;
  text?: string;
  border?: string;
  radius?: number;
  hoverBg?: string;
  hoverText?: string;
  hoverBorder?: string;
  hoverShadow?: "none" | "sm" | "md" | "lg";
  hoverScale?: number;
  transitionMs?: number;
}

export type BlockType =
  | "hero"
  | "portfolio-grid"
  | "services-list"
  | "pack-premium"
  | "testimonials"
  | "timeline-process"
  | "faq-accordion"
  | "video"
  | "full-image"
  | "why-me"
  | "centered-cta"
  | "custom-form"
  | "calendar-booking"
  | "stats-counter"
  | "newsletter"
  | "pricing-table"
  | "feature-grid"
  | "testimonials-carousel"
  | "faq-advanced"
  | "timeline-advanced"
  | "cta-premium"
  | "logo-cloud"
  | "stats-animated"
  | "masonry-gallery"
  | "comparison-table"
  | "contact-form"
  | "blog-preview"
  | "video-text-split"
  | "before-after"
  | "service-cards"
  | "lead-magnet"
  | "availability-banner"
  | "product-hero-checkout"
  | "product-cards-grid"
  | "inline-checkout"
  | "bundle-builder"
  | "pricing-table-real"
  | "hero-split-glow"
  | "hero-centered-mesh"
  | "services-premium"
  | "portfolio-masonry"
  | "pricing-modern"
  | "testimonials-dark"
  | "cta-banner"
  | "contact-premium"
  | "footer-block"
  | "video-showcase"
  | "tech-stack"
  | "before-after-pro"
  // ─── 50 new blocks (library expansion) ───
  | "hero-split-portfolio"
  | "hero-minimal-service"
  | "hero-dark-saas"
  | "hero-creator-brand"
  | "hero-video-showreel"
  | "projects-grid-cases"
  | "projects-horizontal"
  | "project-before-after"
  | "project-timeline"
  | "project-masonry-wall"
  | "services-3card-premium"
  | "services-icon-grid"
  | "services-split-value"
  | "services-process-offers"
  | "product-featured-card"
  | "products-3card-shop"
  | "product-bundle-compare"
  | "product-benefits-mockup"
  | "pricing-3tier-saas"
  | "pricing-custom-quote"
  | "pricing-mini-faq"
  | "testimonials-3dark"
  | "testimonials-video"
  | "results-logos-quotes"
  | "numbers-impact"
  | "results-timeline"
  | "about-personal-story"
  | "about-studio-values"
  | "team-mini-grid"
  | "process-4steps"
  | "process-detailed-timeline"
  | "faq-accordion-full"
  | "faq-2column"
  | "cta-centered-strong"
  | "cta-split-text"
  | "cta-dark-glow"
  | "form-contact-simple"
  | "form-quote-request"
  | "form-newsletter-lead"
  | "media-featured-video"
  | "gallery-3up-strip"
  | "gallery-stacked-storyboard"
  | "content-feature-article"
  | "content-3articles"
  | "content-comparison-why"
  | "trust-badges"
  | "social-proof-marquee"
  | "footer-simple-premium"
  | "footer-multi-column"
  | "signature-creative-closing";

export type HoverEffect = "none" | "lift" | "zoom" | "glow" | "soft-overlay" | "border-glow";
export type SpacingPreset = "compact" | "normal" | "large" | "hero";

export interface BlockStyle {
  backgroundColor?: string;
  textColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  fontSize?: number;
  fontWeight?: string;
  lineHeight?: number;
  textAlign?: "left" | "center" | "right";
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  hoverEffect?: HoverEffect;
  spacingPreset?: SpacingPreset;
  shadow?: "none" | "sm" | "md" | "lg";
  containerWidth?: "full" | "boxed" | "narrow";
  backgroundGradient?: string;
  buttonStyle?: ButtonStyle;
  background?: BackgroundConfig;
}

export type BlockAnimation = "none" | "fade-up" | "fade-down" | "fade-in" | "fade-left" | "fade-right" | "scale-in" | "blur-reveal" | "slide-left";

export interface BlockSettings {
  anchorId?: string;
  animation?: BlockAnimation;
  animationDuration?: number;  // seconds (0.3-1.5)
  animationDelay?: number;     // seconds (0-1)
  variantKey?: string;
}

export interface HeroBlockContent {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  link?: Link;
  blockLink?: BlockLink;
  imageUrl?: string;
}

export interface PortfolioProject {
  title: string;
  imageUrl: string;
  category: string;
  link?: Link;
  slug?: string;
  description?: string;
  images?: string[];
  featured?: boolean;
  clientName?: string;
  result?: string;
  externalUrl?: string;
}

export interface PortfolioGridBlockContent {
  items: PortfolioProject[];
  columns: 2 | 3 | 4;
  categories: string[];
  showFilter: boolean;
  showDetailLink: boolean;
  showSearch?: boolean;
  source?: "manual" | "linked_projects";
  linkedProjectIds?: string[];
  resolvedProjects?: PortfolioCard[];
}

export interface ServicesListBlockContent extends SaleBlockBriefSettings {
  title?: string;
  layout?: "list" | "grid";
  productIds: string[];
  showPrice: boolean;
  showCategory: boolean;
  ctaMode: "product_page" | "product_checkout" | "modal";
}

export interface PackPremiumBlockContent extends SaleBlockBriefSettings {
  productId: string;
  highlight: boolean;
  showFeatures: boolean;
  showPrice: boolean;
  ctaLabel: string;
}

export interface TestimonialsBlockContent {
  testimonials: { name: string; role: string; text: string; avatar?: string }[];
}

export interface TimelineProcessBlockContent {
  steps: { title: string; description: string }[];
}

export interface FaqAccordionBlockContent {
  items: { question: string; answer: string }[];
}

export interface VideoBlockContent {
  videoUrl: string;
  caption?: string;
}

export interface FullImageBlockContent {
  imageUrl: string;
  alt: string;
  overlayText?: string;
  link?: Link;
}

export interface WhyMeBlockContent {
  title: string;
  reasons: { title: string; description: string }[];
}

export interface CenteredCtaBlockContent {
  title: string;
  description: string;
  ctaLabel: string;
  ctaLink: string;
  link?: Link;
  blockLink?: BlockLink;
  productId?: string;
}

export interface CustomFormBlockContent {
  fields: { label: string; type: "text" | "email" | "textarea" | "select"; required: boolean }[];
  submitLabel: string;
  successMessage?: string;
  saveAsLead?: boolean;
  notifyEmail?: string;
  leadSource?: LeadSource;
  leadTags?: string[];
}

export interface CalendarBookingBlockContent {
  title: string;
  description: string;
  provider: "calendly" | "cal";
  embedUrl: string;
  ctaLabel: string;
  openModal: boolean;
  slots: string[];
}

export interface StatsCounterBlockContent {
  stats: { value: string; label: string }[];
}

export interface NewsletterBlockContent {
  title: string;
  description: string;
  placeholder: string;
  buttonLabel: string;
  successMessage?: string;
  saveAsLead?: boolean;
  notifyEmail?: string;
  leadSource?: LeadSource;
  leadTags?: string[];
}

/* ─── New V2 Block Content Types ─── */

export interface PricingTableBlockContent extends SaleBlockBriefSettings {
  title?: string;
  plans: {
    name: string;
    price: number;
    period: "monthly" | "yearly";
    description: string;
    features: string[];
    isPopular: boolean;
    productId?: string;
    ctaLabel: string;
  }[];
  showToggle: boolean;
  columns: 2 | 3 | 4;
  mode?: "manual" | "product";
  productIds?: string[];
}

export interface FeatureGridBlockContent {
  title?: string;
  subtitle?: string;
  features: {
    icon: string;
    title: string;
    description: string;
  }[];
  columns: 2 | 3 | 4;
}

export interface TestimonialsCarouselBlockContent {
  testimonials: {
    name: string;
    role: string;
    text: string;
    avatar?: string;
    rating: number;
  }[];
  autoplay: boolean;
  autoplayInterval: number;
}

export interface FaqAdvancedBlockContent {
  title?: string;
  items: {
    question: string;
    answer: string;
    icon?: string;
  }[];
  allowMultiple: boolean;
  useGlobal: boolean;
}

export interface TimelineAdvancedBlockContent {
  title?: string;
  orientation: "vertical" | "horizontal";
  steps: {
    title: string;
    description: string;
    icon?: string;
  }[];
}

export interface CtaPremiumBlockContent {
  title: string;
  description: string;
  primaryCtaLabel: string;
  primaryLink?: Link;
  primaryBlockLink?: BlockLink;
  secondaryCtaLabel?: string;
  secondaryLink?: Link;
  secondaryBlockLink?: BlockLink;
  backgroundImageUrl?: string;
}

export interface LogoCloudBlockContent {
  title?: string;
  logos: {
    name: string;
    imageUrl: string;
    link?: Link;
  }[];
  grayscale: boolean;
  columns: 3 | 4 | 5 | 6;
}

export interface StatsAnimatedBlockContent {
  stats: {
    value: number;
    suffix: string;
    label: string;
  }[];
  animateOnScroll: boolean;
}

export interface MasonryGalleryBlockContent {
  items: {
    imageUrl: string;
    title?: string;
    link?: Link;
  }[];
  columns: 2 | 3 | 4;
  lightbox: boolean;
  maxImages: number;
}

export interface ComparisonTableBlockContent extends SaleBlockBriefSettings {
  title?: string;
  plans: {
    name: string;
    isHighlighted: boolean;
    productId?: string;
    ctaLabel: string;
  }[];
  rows: {
    feature: string;
    values: (boolean | string)[];
  }[];
  mode?: "manual" | "product";
  productIds?: string[];
}

export interface ContactFormBlockContent {
  title?: string;
  description?: string;
  fields: {
    label: string;
    type: "text" | "email" | "textarea" | "select" | "phone";
    required: boolean;
    options?: string[];
    placeholder?: string;
    mapTo?: "briefing" | "deadline" | "resources" | "notes" | "category";
  }[];
  submitLabel: string;
  successMessage: string;
  notifyEmail?: string;
  saveAsLead: boolean;
  createOrder?: boolean;
  productId?: string;
  briefTemplateId?: string;
}

export interface BlogPreviewBlockContent {
  title?: string;
  posts: {
    title: string;
    excerpt: string;
    imageUrl?: string;
    date: string;
    link?: Link;
  }[];
  columns: 2 | 3;
}

export interface VideoTextSplitBlockContent {
  videoUrl: string;
  videoPosition: "left" | "right";
  title: string;
  description: string;
  ctaLabel?: string;
  link?: Link;
  blockLink?: BlockLink;
}

export interface BeforeAfterBlockContent {
  beforeImageUrl: string;
  afterImageUrl: string;
  beforeLabel: string;
  afterLabel: string;
  initialPosition: number;
}

export interface ServiceCardsBlockContent extends SaleBlockBriefSettings {
  title?: string;
  mode: "static" | "product_reference";
  services: {
    icon: string;
    name: string;
    description: string;
    features: string[];
    price?: number;
    productId?: string;
    ctaLabel: string;
  }[];
  productIds: string[];
  columns: 2 | 3 | 4;
  showPrice: boolean;
  ctaMode: "product_page" | "product_checkout";
}

export interface LeadMagnetBlockContent {
  title: string;
  description: string;
  fileUrl: string;
  buttonLabel: string;
  successMessage: string;
  saveAsLead?: boolean;
  notifyEmail?: string;
  leadSource?: LeadSource;
  leadTags?: string[];
}

/* ─── V1.5 Sale Block Content Types ─── */

export interface ProductHeroCheckoutBlockContent extends SaleBlockBriefSettings {
  productId: string;
  benefits: string[];
  ctaLabel: string;
  showFeatures: boolean;
  layout: "left" | "center";
}

export interface ProductCardsGridBlockContent extends SaleBlockBriefSettings {
  productIds: string[];
  columns: 2 | 3 | 4;
  showFilter: boolean;
  ctaLabel: string;
}

export interface InlineCheckoutBlockContent extends SaleBlockBriefSettings {
  productId: string;
  layout: "compact" | "detailed";
  ctaLabel: string;
}

export interface BundleBuilderBlockContent extends SaleBlockBriefSettings {
  productIds: string[];
  title: string;
  description: string;
  ctaLabel: string;
  discountPercent: number;
}

export interface PricingTableRealBlockContent extends SaleBlockBriefSettings {
  productIds: string[];
  columns: 2 | 3;
  showFeatures: boolean;
  highlightIndex: number;
  ctaLabel: string;
}

export type AvailabilityStatus = "open" | "limited" | "closed";

export interface AvailabilityBannerBlockContent {
  status: AvailabilityStatus;
  message: string;
  ctaLabel?: string;
  ctaLink?: Link;
  blockLink?: BlockLink;
}

/* ─── Premium Block Content Types (Phase 4) ─── */

export interface HeroSplitGlowBlockContent {
  badge?: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  primaryBlockLink?: BlockLink;
  secondaryCtaLabel?: string;
  secondaryBlockLink?: BlockLink;
  imageUrl?: string;
  glowColor?: string;
}

export interface HeroCenteredMeshBlockContent {
  badge?: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  blockLink?: BlockLink;
  trustLogos?: { name: string; imageUrl?: string }[];
  glowColor?: string;
}

export interface ServicesPremiumBlockContent extends SaleBlockBriefSettings {
  title?: string;
  subtitle?: string;
  services: {
    icon: string;
    title: string;
    description: string;
    features?: string[];
  }[];
  columns: 3 | 4;
  mode?: "manual" | "product";
  productIds?: string[];
}

export interface PortfolioMasonryBlockContent {
  title?: string;
  subtitle?: string;
  items: {
    imageUrl: string;
    title: string;
    category: string;
    description?: string;
  }[];
  columns: 2 | 3;
  source?: "manual" | "linked_projects";
  linkedProjectIds?: string[];
  resolvedProjects?: PortfolioCard[];
}

export interface PricingModernBlockContent extends SaleBlockBriefSettings {
  title?: string;
  subtitle?: string;
  mode: "manual" | "product";
  plans: {
    name: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    isPopular: boolean;
    ctaLabel: string;
    productId?: string;
    blockLink?: BlockLink;
  }[];
  productIds: string[];
  highlightProductId?: string;
}

export interface TestimonialsDarkBlockContent {
  title?: string;
  testimonials: {
    name: string;
    role: string;
    company?: string;
    text: string;
    avatar?: string;
    rating?: number;
  }[];
}

export interface CtaBannerBlockContent {
  title: string;
  description: string;
  ctaLabel: string;
  blockLink?: BlockLink;
  secondaryLabel?: string;
  secondaryBlockLink?: BlockLink;
}

export interface ContactPremiumBlockContent {
  title?: string;
  subtitle?: string;
  fields: {
    label: string;
    type: "text" | "email" | "textarea" | "phone" | "select";
    required: boolean;
    placeholder?: string;
    options?: string[];
  }[];
  submitLabel: string;
  successMessage: string;
  saveAsLead: boolean;
  productId?: string;
  briefTemplateId?: string;
}

export interface FooterBlockContent {
  siteName: string;
  description?: string;
  columns: {
    title: string;
    links: { label: string; url?: string }[];
  }[];
  copyright: string;
  showSocials: boolean;
  socials?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    github?: string;
  };
}

export interface VideoShowcaseBlockContent {
  title?: string;
  subtitle?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  stats?: { value: string; label: string }[];
  ctaLabel?: string;
  blockLink?: BlockLink;
  glowColor?: string;
}

export interface TechStackBlockContent {
  title?: string;
  subtitle?: string;
  categories: {
    name: string;
    items: { name: string; icon?: string; description?: string }[];
  }[];
}

export interface BeforeAfterProBlockContent {
  title?: string;
  subtitle?: string;
  items: {
    beforeImageUrl: string;
    afterImageUrl: string;
    label: string;
  }[];
  layout: "slider" | "side-by-side";
}

/* ─── 50 New Block Content Types (Library Expansion) ─── */

export interface HeroSplitPortfolioBlockContent { badge?: string; title: string; subtitle: string; ctaLabel: string; ctaLink?: string; secondaryCtaLabel?: string; secondaryCtaLink?: string; imageUrl?: string; stats?: { value: string; label: string }[]; }
export interface HeroMinimalServiceBlockContent { trustBadge?: string; title: string; subtitle: string; ctaLabel: string; secondaryCtaLabel?: string; proofItems?: { icon: string; text: string }[]; }
export interface HeroDarkSaasBlockContent { title: string; subtitle: string; ctaLabel: string; secondaryCtaLabel?: string; features?: { title: string; description: string }[]; imageUrl?: string; }
export interface HeroCreatorBrandBlockContent { title: string; subtitle: string; credentials?: string[]; ctaLabel: string; secondaryCtaLabel?: string; imageUrl?: string; socialProof?: { value: string; label: string }[]; }
export interface HeroVideoShowreelBlockContent { title: string; subtitle: string; ctaLabel?: string; videoUrl?: string; tags?: string[]; }
/** Resolved portfolio card used by linked_projects blocks */
export interface PortfolioCard {
  projectId: string;
  imageUrl?: string;
  title: string;
  category: string;
  result?: string;
  summary?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  slug?: string;
}

export interface ProjectsGridCasesBlockContent {
  title: string;
  subtitle?: string;
  source?: "manual" | "linked_projects";
  linkedProjectIds?: string[];
  resolvedProjects?: PortfolioCard[];
  projects: { imageUrl?: string; title: string; category: string; result: string }[];
}
export interface ProjectsHorizontalBlockContent {
  title: string;
  subtitle?: string;
  projects: { imageUrl?: string; title: string; category: string }[];
  ctaLabel?: string;
  source?: "manual" | "linked_projects";
  linkedProjectIds?: string[];
  resolvedProjects?: PortfolioCard[];
}
export interface ProjectBeforeAfterBlockContent {
  title: string;
  subtitle?: string;
  items: { beforeLabel: string; afterLabel: string; beforeImageUrl?: string; afterImageUrl?: string; resultText: string; metricBadge?: string; description: string; category?: string }[];
  linkedProjectId?: string;
}
export interface ProjectTimelineBlockContent {
  title: string;
  subtitle?: string;
  steps: { title: string; description: string; tag?: string }[];
  resultSummary?: string;
  linkedProjectId?: string;
}
export interface ProjectMasonryWallBlockContent {
  title?: string;
  source?: "manual" | "linked_projects";
  linkedProjectIds?: string[];
  resolvedProjects?: PortfolioCard[];
  items: { imageUrl?: string; title: string; category: string }[];
  columns?: number;
}
export interface Services3CardPremiumBlockContent extends SaleBlockBriefSettings {
  title: string;
  subtitle?: string;
  services: { title: string; description: string; features: string[]; ctaLabel: string }[];
  mode?: "manual" | "product";
  productIds?: string[];
}
export interface ServicesIconGridBlockContent {
  title: string;
  subtitle?: string;
  services: { icon: string; title: string; description: string }[];
  mode?: "static" | "product";
  productIds?: string[];
}
export interface ServicesSplitValueBlockContent { title: string; subtitle: string; description: string; pillars: { title: string; description: string }[]; }
export interface ServicesProcessOffersBlockContent extends SaleBlockBriefSettings {
  title: string;
  offers: { title: string; description: string; steps: string[] }[];
  mode?: "manual" | "product";
  productIds?: string[];
}
export interface ProductFeaturedCardBlockContent extends SaleBlockBriefSettings {
  title: string;
  description: string;
  price: string;
  benefits: string[];
  ctaLabel: string;
  imageUrl?: string;
  trustNote?: string;
  mode?: "manual" | "product";
  productId?: string;
}
export interface Products3CardShopBlockContent extends SaleBlockBriefSettings {
  title: string;
  subtitle?: string;
  products: { imageUrl?: string; title: string; price: string; description: string; ctaLabel: string }[];
  mode?: "manual" | "product";
  productIds?: string[];
}
export interface ProductBundleCompareBlockContent extends SaleBlockBriefSettings {
  title: string;
  subtitle?: string;
  bundles: { name: string; price: string; description: string; features: string[]; isPopular?: boolean; ctaLabel: string }[];
  mode?: "manual" | "product";
  productIds?: string[];
}
export interface ProductBenefitsMockupBlockContent extends SaleBlockBriefSettings {
  title: string;
  subtitle: string;
  benefits: string[];
  ctaLabel: string;
  imageUrl?: string;
  mode?: "manual" | "product";
  productId?: string;
}
export interface Pricing3TierSaasBlockContent extends SaleBlockBriefSettings {
  title: string;
  subtitle?: string;
  plans: { name: string; price: string; period: string; description: string; features: string[]; isPopular?: boolean; ctaLabel: string }[];
  mode?: "manual" | "product";
  productIds?: string[];
}
export interface PricingCustomQuoteBlockContent extends SaleBlockBriefSettings {
  title: string;
  subtitle: string;
  features: string[];
  ctaLabel: string;
  note?: string;
  mode?: "manual" | "product";
  productId?: string;
  blockLink?: BlockLink;
}
export interface PricingMiniFaqBlockContent extends SaleBlockBriefSettings {
  title?: string;
  plans: { name: string; price: string; features: string[]; ctaLabel: string }[];
  faq: { question: string; answer: string }[];
  mode?: "manual" | "product";
  productIds?: string[];
}
export interface Testimonials3DarkBlockContent { title: string; testimonials: { name: string; role: string; company: string; text: string; rating: number }[]; }
export interface TestimonialsVideoBlockContent { title: string; subtitle?: string; testimonials: { name: string; company: string; quote: string; videoUrl?: string; thumbnailUrl?: string }[]; }
export interface ResultsLogosQuotesBlockContent { title?: string; logos: { name: string; imageUrl?: string }[]; quotes: { text: string; name: string; role: string }[]; }
export interface NumbersImpactBlockContent { title?: string; subtitle?: string; stats: { value: string; label: string; context?: string }[]; }
export interface ResultsTimelineBlockContent { title: string; subtitle?: string; milestones: { label: string; value: string; description: string }[]; }
export interface AboutPersonalStoryBlockContent { title: string; story: string; highlights?: string[]; imageUrl?: string; mission?: string; }
export interface AboutStudioValuesBlockContent { title: string; subtitle?: string; values: { title: string; description: string; icon?: string }[]; teamNote?: string; }
export interface TeamMiniGridBlockContent { title: string; subtitle?: string; members: { name: string; role: string; bio: string; imageUrl?: string; socials?: { network: string; url: string }[] }[]; }
export interface Process4StepsBlockContent { title: string; subtitle?: string; steps: { title: string; description: string; icon?: string }[]; }
export interface ProcessDetailedTimelineBlockContent { title: string; subtitle?: string; steps: { title: string; description: string; tag?: string; details?: string }[]; }
export interface FaqAccordionFullBlockContent { title: string; subtitle?: string; items: { question: string; answer: string }[]; }
export interface Faq2ColumnBlockContent { title: string; subtitle?: string; items: { question: string; answer: string }[]; }
export interface CtaCenteredStrongBlockContent { title: string; subtitle?: string; ctaLabel: string; secondaryCtaLabel?: string; }
export interface CtaSplitTextBlockContent { title: string; description: string; ctaLabel: string; secondaryCtaLabel?: string; }
export interface CtaDarkGlowBlockContent { title: string; subtitle: string; ctaLabel: string; trustBadges?: string[]; }
export interface FormContactSimpleBlockContent {
  title: string;
  subtitle?: string;
  fields: { label: string; type: string; placeholder?: string; required?: boolean }[];
  submitLabel: string;
  trustNote?: string;
  successMessage?: string;
  saveAsLead?: boolean;
  notifyEmail?: string;
  leadSource?: LeadSource;
  leadTags?: string[];
}
export interface FormQuoteRequestBlockContent {
  title: string;
  subtitle?: string;
  fields: { label: string; type: string; placeholder?: string; required?: boolean; options?: string[] }[];
  submitLabel: string;
  sideText?: string;
  successMessage?: string;
  saveAsLead?: boolean;
  notifyEmail?: string;
  leadSource?: LeadSource;
  leadTags?: string[];
}
export interface FormNewsletterLeadBlockContent {
  title: string;
  subtitle: string;
  placeholder: string;
  ctaLabel: string;
  privacyNote?: string;
  successMessage?: string;
  saveAsLead?: boolean;
  notifyEmail?: string;
  leadSource?: LeadSource;
  leadTags?: string[];
}
export interface MediaFeaturedVideoBlockContent { title: string; subtitle?: string; videoUrl?: string; thumbnailUrl?: string; secondaryVideos?: { title: string; thumbnailUrl?: string }[]; }
export interface Gallery3UpStripBlockContent { title?: string; items: { imageUrl?: string; caption?: string }[]; }
export interface GalleryStackedStoryboardBlockContent { title?: string; items: { imageUrl?: string; title: string; description: string }[]; }
export interface ContentFeatureArticleBlockContent { title: string; excerpt: string; imageUrl?: string; ctaLabel: string; category?: string; date?: string; }
export interface Content3ArticlesBlockContent { title: string; subtitle?: string; articles: { title: string; excerpt: string; imageUrl?: string; category?: string; date?: string }[]; }
export interface ContentComparisonWhyBlockContent { title: string; subtitle?: string; leftColumn: { title: string; items: string[] }; rightColumn: { title: string; items: string[] }; }
export interface TrustBadgesBlockContent { title?: string; badges: { icon: string; title: string; description: string }[]; }
export interface SocialProofMarqueeBlockContent { items: { text: string; name: string; result?: string }[]; speed?: number; }
export interface FooterSimplePremiumBlockContent { siteName: string; links: { label: string; url?: string }[]; copyright: string; showSocials?: boolean; socials?: Record<string, string>; }
export interface FooterMultiColumnBlockContent { siteName: string; description?: string; columns: { title: string; links: { label: string; url?: string }[] }[]; copyright: string; contact?: { email?: string; phone?: string; address?: string }; showSocials?: boolean; socials?: Record<string, string>; }
export interface SignatureCreativeClosingBlockContent { title: string; subtitle: string; ctaLabel: string; signatureNote?: string; }

/* ─── Brief / Questionnaire Types ─── */

export type BriefFieldType =
  | "text" | "textarea" | "number" | "date"
  | "select" | "checkbox" | "radio"
  | "file" | "url" | "email" | "phone";

export interface BriefField {
  key: string;
  label: string;
  type: BriefFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  multiple?: boolean;
  accept?: string;
  pinned?: boolean;
  help?: string;
  target_kind?: 'custom_answer' | 'order_field' | 'order_custom_property';
  target_ref?: string;
  destinationType?: 'brief_only' | 'column_default' | 'detail_field' | 'column_custom';
  destinationKey?: string;
  destinationColumnId?: string;
  destinationColumnLabel?: string;
}

export interface BriefTemplate {
  id: string;
  name: string;
  description?: string;
  version: number;
  fields: BriefField[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductBrief {
  id: string;
  productId: string;
  briefTemplateId: string;
  isDefault: boolean;
}

export interface OrderBriefResponse {
  orderId: string;
  briefTemplateId: string | null;
  briefName: string;
  briefVersion: number;
  answers: Record<string, unknown>;
  pinned: string[];
  fieldsSnapshot: BriefField[];
  fieldSources?: Record<string, { target_kind: string; target_ref: string }>;
}

/** @deprecated Use ORDER_DETAIL_FIELDS instead */
export const MAPPABLE_ORDER_FIELDS = [
  { value: 'deadline', label: 'Deadline', briefTypes: ['date'] },
  { value: 'notes', label: 'Notes', briefTypes: ['text', 'textarea'] },
  { value: 'briefing', label: 'Briefing', briefTypes: ['text', 'textarea'] },
  { value: 'category', label: 'Catégorie', briefTypes: ['text', 'select'] },
  { value: 'external_ref', label: 'Réf. externe', briefTypes: ['text'] },
  { value: 'tags', label: 'Tags', briefTypes: ['checkbox'] },
] as const;

/**
 * Order detail fields — fields on the order record (drawer / detail view)
 * that are NOT system board columns (title/client/price/status/deadline/date).
 */
export const ORDER_DETAIL_FIELDS = [
  { key: 'priority',     label: 'Priorité',      briefTypes: ['select', 'radio', 'text'] },
  { key: 'paid',         label: 'Payé',           briefTypes: ['checkbox'] },
  { key: 'notes',        label: 'Notes',          briefTypes: ['text', 'textarea'] },
  { key: 'briefing',     label: 'Briefing',       briefTypes: ['text', 'textarea'] },
  { key: 'resources',    label: 'Ressources',     briefTypes: ['file', 'url', 'text'] },
  { key: 'category',     label: 'Catégorie',      briefTypes: ['text', 'select'] },
  { key: 'external_ref', label: 'Réf. externe',   briefTypes: ['text'] },
  { key: 'tags',         label: 'Tags',           briefTypes: ['checkbox'] },
  { key: 'checklist',    label: 'Checklist',      briefTypes: ['checkbox'] },
] as const;

/* ─── Sale block brief settings (shared across all sale blocks) ─── */

export interface SaleBlockBriefSettings {
  briefTemplateId?: string | null;
  useProductDefaultBrief?: boolean;
  briefRequired?: boolean;
}

/* ─── Analytics Types ─── */

export type AnalyticsEventType = "page_view" | "click_cta" | "form_submit" | "order_start" | "order_complete";

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  page?: string;
  data?: Record<string, string>;
  timestamp: string;
}

/* ─── Lead Type ─── */

export type LeadSource =
  | "contact-form"
  | "custom-form"
  | "quote-request"
  | "newsletter"
  | "lead-magnet"
  | "checkout"
  | "booking"
  | "signup"
  | "other";

export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost" | "archived";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  source: LeadSource | string;
  status: LeadStatus;
  message: string | null;
  fields: Record<string, unknown>;
  page_path: string | null;
  block_type: string | null;
  block_label: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  product_name: string | null;
  amount: number | null;
  notes: string | null;
  created_at: string;
}

/* ─── Nav / Footer / Member Types ─── */

export type NavbarVariant =
  | "classic-floating"     // V1 — White floating SaaS
  | "dark-premium"         // V2 — Dark premium centered
  | "capsule"              // V3 — Pill/capsule navigation
  | "brand-heavy"          // V4 — Brand-forward creator
  | "dual-cta"             // V5 — Sales-oriented dual CTA
  | "dropdown-rich"        // V6 — Resource/dropdown heavy
  | "creative-split"       // V7 — Creative asymmetric
  | "signature"            // V8 — High-end original
  ;

export interface NavLink {
  id?: string;
  label: string;
  destinationType?: "section" | "page" | "external";
  pageId?: string;
  url?: string;
  blockId?: string;       // target block id for scroll-to, or "__top" for top of page
  openNewTab?: boolean;
  children?: NavLink[];   // dropdown submenu items
}

export interface NavSocialLink {
  network: "instagram" | "twitter" | "linkedin" | "youtube" | "tiktok" | "github" | "dribbble" | "behance";
  url: string;
}

export interface NavConfig {
  variant?: NavbarVariant;
  links: NavLink[];
  showCta: boolean;
  ctaLabel: string;
  ctaLink?: Link; // legacy — use ctaDestinationType/ctaPageId/ctaBlockId/ctaUrl instead
  // CTA destination (same shape as NavLink for DestinationPicker compatibility)
  ctaDestinationType?: "section" | "page" | "external";
  ctaPageId?: string;
  ctaBlockId?: string;
  ctaUrl?: string;
  ctaOpenNewTab?: boolean;
  showSecondaryCta?: boolean;
  secondaryCtaLabel?: string;
  secondaryCtaLink?: Link; // legacy
  // Secondary CTA destination
  secondaryCtaDestinationType?: "section" | "page" | "external";
  secondaryCtaPageId?: string;
  secondaryCtaBlockId?: string;
  secondaryCtaUrl?: string;
  secondaryCtaOpenNewTab?: boolean;
  showSocials?: boolean;
  socials?: NavSocialLink[];
  sticky?: boolean;
  // Scroll behavior
  scrollBehavior?: "static" | "sticky" | "fixed" | "auto-hide" | "transparent-to-solid";
  scrollThreshold?: number;       // px before behavior activates (default: 50)
  scrollShrink?: boolean;         // reduce height on scroll
  scrollAddShadow?: boolean;      // add shadow after threshold
  scrollAddBlur?: boolean;        // add blur after threshold
  scrollChangeBg?: boolean;       // change bg to solid after threshold
  scrollAnimation?: "none" | "fade" | "slide" | "smooth";
  scrollAnimDuration?: number;    // ms (default: 300)
  // Active link section spy
  activeLinkSpy?: boolean;        // auto-highlight nav link for visible section
  activeLinkStyle?: "underline" | "pill" | "dot" | "glow" | "none";
  // Style extras
  linkColor?: string;
  linkHoverColor?: string;
  activeLinkColor?: string;
  navBgColor?: string;
  navBorderColor?: string;
  navBorderWidth?: number;
  navBorderRadius?: number;       // px
  navShadowIntensity?: "none" | "sm" | "md" | "lg";
  containerWidth?: "full" | "boxed" | "narrow";
  bgMode?: "solid" | "blur" | "transparent";
  showBorder?: boolean;
  showShadow?: boolean;
  density?: "compact" | "default" | "spacious";
  // CTA button customization
  ctaStyle?: "filled" | "outline" | "ghost" | "soft";
  ctaBgColor?: string;
  ctaTextColor?: string;
  ctaBorderRadius?: string;
  // Secondary CTA button customization
  secondaryCtaStyle?: "outline" | "filled" | "ghost" | "soft";
  secondaryCtaBgColor?: string;
  secondaryCtaTextColor?: string;
  secondaryCtaBorderColor?: string;
}

export interface FooterLink {
  label: string;
  destinationType?: "section" | "page" | "external";
  pageId?: string;
  url?: string;
  blockId?: string;       // target block id for scroll-to, or "__top"
  openNewTab?: boolean;
}

export interface FooterConfig {
  links: FooterLink[];
  showSocials: boolean;
  copyright: string;
}

export interface SiteMember {
  userId: string;
  role: "owner" | "editor" | "viewer";
  email: string;
}

export type BlockContentMap = {
  hero: HeroBlockContent;
  "portfolio-grid": PortfolioGridBlockContent;
  "services-list": ServicesListBlockContent;
  "pack-premium": PackPremiumBlockContent;
  testimonials: TestimonialsBlockContent;
  "timeline-process": TimelineProcessBlockContent;
  "faq-accordion": FaqAccordionBlockContent;
  video: VideoBlockContent;
  "full-image": FullImageBlockContent;
  "why-me": WhyMeBlockContent;
  "centered-cta": CenteredCtaBlockContent;
  "custom-form": CustomFormBlockContent;
  "calendar-booking": CalendarBookingBlockContent;
  "stats-counter": StatsCounterBlockContent;
  newsletter: NewsletterBlockContent;
  "pricing-table": PricingTableBlockContent;
  "feature-grid": FeatureGridBlockContent;
  "testimonials-carousel": TestimonialsCarouselBlockContent;
  "faq-advanced": FaqAdvancedBlockContent;
  "timeline-advanced": TimelineAdvancedBlockContent;
  "cta-premium": CtaPremiumBlockContent;
  "logo-cloud": LogoCloudBlockContent;
  "stats-animated": StatsAnimatedBlockContent;
  "masonry-gallery": MasonryGalleryBlockContent;
  "comparison-table": ComparisonTableBlockContent;
  "contact-form": ContactFormBlockContent;
  "blog-preview": BlogPreviewBlockContent;
  "video-text-split": VideoTextSplitBlockContent;
  "before-after": BeforeAfterBlockContent;
  "service-cards": ServiceCardsBlockContent;
  "lead-magnet": LeadMagnetBlockContent;
  "availability-banner": AvailabilityBannerBlockContent;
  "product-hero-checkout": ProductHeroCheckoutBlockContent;
  "product-cards-grid": ProductCardsGridBlockContent;
  "inline-checkout": InlineCheckoutBlockContent;
  "bundle-builder": BundleBuilderBlockContent;
  "pricing-table-real": PricingTableRealBlockContent;
  "hero-split-glow": HeroSplitGlowBlockContent;
  "hero-centered-mesh": HeroCenteredMeshBlockContent;
  "services-premium": ServicesPremiumBlockContent;
  "portfolio-masonry": PortfolioMasonryBlockContent;
  "pricing-modern": PricingModernBlockContent;
  "testimonials-dark": TestimonialsDarkBlockContent;
  "cta-banner": CtaBannerBlockContent;
  "contact-premium": ContactPremiumBlockContent;
  "footer-block": FooterBlockContent;
  "video-showcase": VideoShowcaseBlockContent;
  "tech-stack": TechStackBlockContent;
  "before-after-pro": BeforeAfterProBlockContent;
  // ─── 50 new blocks ───
  "hero-split-portfolio": HeroSplitPortfolioBlockContent;
  "hero-minimal-service": HeroMinimalServiceBlockContent;
  "hero-dark-saas": HeroDarkSaasBlockContent;
  "hero-creator-brand": HeroCreatorBrandBlockContent;
  "hero-video-showreel": HeroVideoShowreelBlockContent;
  "projects-grid-cases": ProjectsGridCasesBlockContent;
  "projects-horizontal": ProjectsHorizontalBlockContent;
  "project-before-after": ProjectBeforeAfterBlockContent;
  "project-timeline": ProjectTimelineBlockContent;
  "project-masonry-wall": ProjectMasonryWallBlockContent;
  "services-3card-premium": Services3CardPremiumBlockContent;
  "services-icon-grid": ServicesIconGridBlockContent;
  "services-split-value": ServicesSplitValueBlockContent;
  "services-process-offers": ServicesProcessOffersBlockContent;
  "product-featured-card": ProductFeaturedCardBlockContent;
  "products-3card-shop": Products3CardShopBlockContent;
  "product-bundle-compare": ProductBundleCompareBlockContent;
  "product-benefits-mockup": ProductBenefitsMockupBlockContent;
  "pricing-3tier-saas": Pricing3TierSaasBlockContent;
  "pricing-custom-quote": PricingCustomQuoteBlockContent;
  "pricing-mini-faq": PricingMiniFaqBlockContent;
  "testimonials-3dark": Testimonials3DarkBlockContent;
  "testimonials-video": TestimonialsVideoBlockContent;
  "results-logos-quotes": ResultsLogosQuotesBlockContent;
  "numbers-impact": NumbersImpactBlockContent;
  "results-timeline": ResultsTimelineBlockContent;
  "about-personal-story": AboutPersonalStoryBlockContent;
  "about-studio-values": AboutStudioValuesBlockContent;
  "team-mini-grid": TeamMiniGridBlockContent;
  "process-4steps": Process4StepsBlockContent;
  "process-detailed-timeline": ProcessDetailedTimelineBlockContent;
  "faq-accordion-full": FaqAccordionFullBlockContent;
  "faq-2column": Faq2ColumnBlockContent;
  "cta-centered-strong": CtaCenteredStrongBlockContent;
  "cta-split-text": CtaSplitTextBlockContent;
  "cta-dark-glow": CtaDarkGlowBlockContent;
  "form-contact-simple": FormContactSimpleBlockContent;
  "form-quote-request": FormQuoteRequestBlockContent;
  "form-newsletter-lead": FormNewsletterLeadBlockContent;
  "media-featured-video": MediaFeaturedVideoBlockContent;
  "gallery-3up-strip": Gallery3UpStripBlockContent;
  "gallery-stacked-storyboard": GalleryStackedStoryboardBlockContent;
  "content-feature-article": ContentFeatureArticleBlockContent;
  "content-3articles": Content3ArticlesBlockContent;
  "content-comparison-why": ContentComparisonWhyBlockContent;
  "trust-badges": TrustBadgesBlockContent;
  "social-proof-marquee": SocialProofMarqueeBlockContent;
  "footer-simple-premium": FooterSimplePremiumBlockContent;
  "footer-multi-column": FooterMultiColumnBlockContent;
  "signature-creative-closing": SignatureCreativeClosingBlockContent;
};

export type Block = {
  [K in BlockType]: {
    id: string;
    type: K;
    content: BlockContentMap[K];
    style: BlockStyle;
    settings: BlockSettings;
    visible: boolean;
  };
}[BlockType];

export type SitePageStatus = "published" | "draft";

export interface SitePage {
  id: string;
  name: string;
  slug: string;
  status: SitePageStatus;
  blocks: Block[];
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
}

export interface SiteTheme {
  /* Colors */
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  borderColor?: string;

  /* Typography */
  fontFamily: string;
  headingFont?: string;
  headingWeight?: "400" | "500" | "600" | "700" | "800" | "900";
  bodyWeight?: "300" | "400" | "500";
  lineHeight?: "tight" | "normal" | "relaxed";
  letterSpacing?: "tight" | "normal" | "wide";
  buttonCase?: "normal" | "uppercase";

  /* Shape */
  borderRadius: "none" | "rounded" | "pill";
  shadow: "none" | "sm" | "md" | "lg";

  /* Layout */
  mode?: "light" | "dark";
  containerWidth?: "narrow" | "default" | "wide";
  density?: "compact" | "balanced" | "spacious";
  sectionGap?: "none" | "compact" | "normal" | "large" | "hero";

  /* Buttons */
  buttonRadius?: "none" | "sm" | "md" | "full";
  buttonStyle?: "filled" | "outline" | "ghost" | "soft";
  buttonBg?: string;
  buttonText?: string;
  buttonBorder?: string;
  buttonHoverBg?: string;
  buttonHoverText?: string;
  buttonHoverBorder?: string;
  buttonHoverShadow?: "none" | "sm" | "md" | "lg";
  buttonHoverScale?: number;

  /* Cards & surfaces */
  cardRadius?: "none" | "sm" | "md" | "lg" | "xl";
  cardShadow?: "none" | "sm" | "md" | "lg";
  cardBorder?: boolean;

  /* Motion */
  hoverLift?: "none" | "subtle" | "medium" | "strong";
  transitionSpeed?: "fast" | "normal" | "slow";
}

export type BackgroundPreset = "none" | "solid" | "glow" | "mesh" | "grid-tech" | "noise" | "dots" | "gradient-radial" | "particles-float" | "particles-constellation" | "particles-aura" | "luxe-waves" | "halo-spotlight";

export type BackgroundPosition = "center" | "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface BackgroundConfig {
  type: BackgroundPreset;
  primaryColor?: string;
  secondaryColor?: string;
  opacity?: number;       // 0-1 (visual strength)
  size?: number;          // px (grid spacing / dot spacing / halo spread / noise scale)
  blur?: number;          // px (glow/halo blur)
  density?: number;       // particle count factor (0.2-2)
  speed?: number;         // animation speed factor (0.2-2)
  particleSize?: number;  // particle size in px (1-6)
  position?: BackgroundPosition; // focal point for glow/halo/radial/aura
  lineWidth?: number;     // grid line thickness (0.5-3 px)
  dotSize?: number;       // dot radius (0.5-4 px)
}

export type DesignKey = "creator" | "product" | "cinema" | "studio" | "neon" | "editorial" | "custom";

export interface SiteDesign {
  designKey: DesignKey;
  backgroundPreset: BackgroundPreset;
  background?: BackgroundConfig;
  heroVariant: string;
  cardStyle: "flat" | "bordered" | "elevated" | "glass";
  buttonVariant: "solid" | "outline" | "ghost" | "gradient";
  navStyle: "transparent" | "solid" | "blur";
  footerStyle: "minimal" | "columns" | "centered";
}

export interface SiteDomainSettings {
  subdomain: string;
  customDomain?: string;
}

export interface SiteSeoSettings {
  globalTitle: string;
  globalDescription: string;
  ogImageUrl?: string;
}

export interface SiteSettings {
  name: string;
  description: string;
  logoUrl?: string;
  faviconUrl?: string;
  maintenanceMode: boolean;
  socials: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  i18n?: { locales: string[]; defaultLocale: string };
}

export interface Site {
  id: string;
  settings: SiteSettings;
  theme: SiteTheme;
  design?: SiteDesign;
  pages: SitePage[];
  domain: SiteDomainSettings;
  seo: SiteSeoSettings;
  nav?: NavConfig;
  footer?: FooterConfig;
  members?: SiteMember[];
  /** Base path for internal links. "" on subdomain, "/s/{slug}" on localhost/preview. */
  basePath?: string;
  /** Site publication status from DB. */
  status?: "draft" | "published";
  /** ISO timestamp of last publication. */
  publishedAt?: string;
}

export type SiteOrderStatus = "pending" | "in_progress" | "delivered" | "cancelled";

export interface SiteOrder {
  id: string;
  client: string;
  clientEmail: string;
  service: string;
  price: number;
  status: SiteOrderStatus;
  date: string;
  message?: string;
}

export interface SiteTemplate {
  id: string;
  name: string;
  description: string;
  gradient: string;
  pages: SitePage[];
}
