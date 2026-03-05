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
  resources?: string[];
  category?: string;
  externalRef?: string;
  groupId?: string;
  groupIndex?: number;
  groupTotal?: number;
  customFields?: Record<string, unknown>;
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
  | { type: "product"; productId: string; mode: "page" | "checkout" };

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
  | "pricing-table-real";

export interface BlockStyle {
  backgroundColor?: string;
  textColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginTop?: number;
  marginBottom?: number;
  fontSize?: number;
  fontWeight?: string;
  lineHeight?: number;
  textAlign?: "left" | "center" | "right";
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  shadow?: "none" | "sm" | "md" | "lg";
  containerWidth?: "full" | "boxed" | "narrow";
  backgroundGradient?: string;
  buttonStyle?: ButtonStyle;
}

export type BlockAnimation = "none" | "fade-up" | "fade-in" | "slide-left";

export interface BlockSettings {
  anchorId?: string;
  animation?: BlockAnimation;
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

export interface PortfolioGridBlockContent {
  items: {
    title: string;
    imageUrl: string;
    category: string;
    link?: Link;
    slug?: string;
    description?: string;
    images?: string[];
    featured?: boolean;
  }[];
  columns: 2 | 3 | 4;
  categories: string[];
  showFilter: boolean;
  showDetailLink: boolean;
  showSearch?: boolean;
}

export interface ServicesListBlockContent {
  title?: string;
  layout?: "list" | "grid";
  productIds: string[];
  showPrice: boolean;
  showCategory: boolean;
  ctaMode: "product_page" | "product_checkout" | "modal";
}

export interface PackPremiumBlockContent {
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
}

/* ─── New V2 Block Content Types ─── */

export interface PricingTableBlockContent {
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

export interface ComparisonTableBlockContent {
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
  }[];
  submitLabel: string;
  successMessage: string;
  notifyEmail?: string;
  saveAsLead: boolean;
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

export interface ServiceCardsBlockContent {
  title?: string;
  services: {
    icon: string;
    name: string;
    description: string;
    features: string[];
    price?: number;
    productId?: string;
    ctaLabel: string;
  }[];
  columns: 2 | 3;
}

export interface LeadMagnetBlockContent {
  title: string;
  description: string;
  fileUrl: string;
  buttonLabel: string;
  successMessage: string;
}

/* ─── V1.5 Sale Block Content Types ─── */

export interface ProductHeroCheckoutBlockContent {
  productId: string;
  benefits: string[];
  ctaLabel: string;
  showFeatures: boolean;
  layout: "left" | "center";
}

export interface ProductCardsGridBlockContent {
  productIds: string[];
  columns: 2 | 3 | 4;
  showFilter: boolean;
  ctaLabel: string;
}

export interface InlineCheckoutBlockContent {
  productId: string;
  layout: "compact" | "detailed";
  ctaLabel: string;
}

export interface BundleBuilderBlockContent {
  productIds: string[];
  title: string;
  description: string;
  ctaLabel: string;
  discountPercent: number;
}

export interface PricingTableRealBlockContent {
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

export interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  date: string;
  fields: Record<string, string>;
}

/* ─── Nav / Footer / Member Types ─── */

export interface NavConfig {
  links: { label: string; pageId?: string; url?: string }[];
  showCta: boolean;
  ctaLabel: string;
  ctaLink?: Link;
}

export interface FooterConfig {
  links: { label: string; pageId?: string; url?: string }[];
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
  primaryColor: string;
  fontFamily: string;
  borderRadius: "none" | "rounded" | "pill";
  shadow: "none" | "sm" | "md" | "lg";
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
  pages: SitePage[];
  domain: SiteDomainSettings;
  seo: SiteSeoSettings;
  nav?: NavConfig;
  footer?: FooterConfig;
  members?: SiteMember[];
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
