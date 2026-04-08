export type HelpDifficulty = "Débutant" | "Intermédiaire" | "Avancé";

export type HelpSection = {
  heading: string;
  body: string[];
  bullets?: string[];
};

export type HelpFaqItem = {
  question: string;
  answer: string;
};

export type HelpCategory = {
  slug: string;
  title: string;
  description: string;
  icon: string; // emoji
  articleSlugs: string[];
  guideSlugs?: string[];
  featured?: boolean;
};

export type HelpArticle = {
  slug: string;
  title: string;
  categorySlug: string;
  excerpt: string;
  searchKeywords?: string[];
  popular?: boolean;
  featured?: boolean;
  updatedAt?: string;
  readingTime?: string;
  difficulty?: HelpDifficulty;
  relatedArticleSlugs?: string[];
  relatedGuideSlugs?: string[];
  sections: HelpSection[];
  commonMistakes?: string[];
  faq?: HelpFaqItem[];
};

export type HelpGuideStep = {
  title: string;
  description: string[];
  tips?: string[];
  commonMistakes?: string[];
  links?: { label: string; href: string }[];
  screenshot?: string; // légende d'une capture à venir
};

export type HelpGuide = {
  slug: string;
  title: string;
  excerpt: string;
  intro?: string;
  duration: string;
  audience: string;
  objective: string;
  prerequisites?: string[];
  steps: HelpGuideStep[];
  checklist?: string[];
  commonMistakes?: string[];
  nextSteps?: { label: string; href: string; description?: string }[];
  relatedArticleSlugs?: string[];
};

export type HelpParcours = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  guideSlugs: string[];
};

export type HelpSearchResult = {
  type: "article" | "guide" | "category";
  slug: string;
  title: string;
  excerpt: string;
  href: string;
  categoryTitle?: string;
  score: number;
};
