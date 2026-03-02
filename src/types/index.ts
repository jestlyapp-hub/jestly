export type OrderStatus = "pending" | "in_progress" | "delivered" | "cancelled";
export type InvoiceStatus = "paid" | "pending" | "overdue";
export type SubscriptionStatus = "active" | "cancelled" | "paused";

export interface Order {
  id: string;
  client: string;
  clientEmail: string;
  product: string;
  price: number;
  status: OrderStatus;
  date: string;
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

export type ProductType = "service" | "pack" | "digital";

export interface Product {
  id: string;
  name: string;
  price: number;
  active: boolean;
  sales: number;
  category: string;
  type: ProductType;
  slug: string;
  shortDescription: string;
  longDescription?: string;
  features?: string[];
  deliveryTimeDays?: number;
  thumbnailUrl?: string;
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
  | "newsletter";

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
  shadow?: "none" | "sm" | "md" | "lg";
  containerWidth?: "full" | "boxed" | "narrow";
  backgroundGradient?: string;
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
  imageUrl?: string;
}

export interface PortfolioGridBlockContent {
  items: { title: string; imageUrl: string; category: string }[];
  columns: 2 | 3 | 4;
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
  productId?: string;
}

export interface CustomFormBlockContent {
  fields: { label: string; type: "text" | "email" | "textarea" | "select"; required: boolean }[];
  submitLabel: string;
}

export interface CalendarBookingBlockContent {
  title: string;
  description: string;
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
}

export interface Site {
  id: string;
  settings: SiteSettings;
  theme: SiteTheme;
  pages: SitePage[];
  domain: SiteDomainSettings;
  seo: SiteSeoSettings;
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
