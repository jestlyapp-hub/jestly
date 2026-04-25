import type { EcomStage, EcomBadge } from "./types";

// ── Badges ──────────────────────────────────────────────────────────

export const ECOM_BADGES: EcomBadge[] = [
  { id: "b1", title: "Premier pas", description: "Première tâche complétée", emoji: "🎯", unlocked: true, tier: "bronze" },
  { id: "b2", title: "Niche trouvée", description: "Niche validée avec succès", emoji: "💎", unlocked: true, tier: "bronze" },
  { id: "b3", title: "Boutique en ligne", description: "Boutique lancée et validée", emoji: "🏪", unlocked: false, tier: "argent" },
  { id: "b4", title: "Ads Master", description: "Premières campagnes lancées", emoji: "📢", unlocked: false, tier: "argent" },
  { id: "b5", title: "Revenue 10K", description: "Objectif 10K/mois atteint", emoji: "🚀", unlocked: false, tier: "or" },
  { id: "b6", title: "Scale Machine", description: "Scaling multi-canal activé", emoji: "⚡", unlocked: false, tier: "platine" },
  { id: "b7", title: "Série de 7", description: "7 jours d'activité consécutifs", emoji: "🔥", unlocked: true, tier: "bronze" },
  { id: "b8", title: "Complétionniste", description: "Toutes les tâches d'une étape", emoji: "✅", unlocked: false, tier: "or" },
];

// ── Stages ──────────────────────────────────────────────────────────

export const ECOM_STAGES: EcomStage[] = [
  // ────────────────────────── ÉTAPE 1 ──────────────────────────
  {
    id: "s1",
    number: 1,
    title: "Démarrage",
    subtitle: "Fondations, mindset & validation de niche",
    objective: "Poser les bases solides de votre business e-commerce",
    iconName: "Compass",
    status: "in_progress",
    estimatedDuration: "1-2 semaines",
    difficulty: "débutant",
    modules: [
      { id: "m1-1", title: "Introduction au e-commerce", duration: "25 min", completed: true, importance: "fondation", benefit: "Comprendre le modèle et les leviers de réussite", xp: 15 },
      { id: "m1-2", title: "Mindset & discipline entrepreneuriale", duration: "30 min", completed: true, importance: "fondation", benefit: "Construire la mentalité qui fait la différence", xp: 15 },
      { id: "m1-3", title: "Fiscalité & statut juridique", duration: "20 min", completed: false, importance: "fondation", benefit: "Éviter les erreurs légales coûteuses", xp: 10 },
      { id: "m1-4", title: "Recherche & validation de niche", duration: "45 min", completed: false, importance: "fondation", benefit: "Trouver un marché rentable et durable", xp: 20 },
    ],
    tasks: [
      { id: "t1-1", title: "Réserver l'appel d'onboarding", priority: "important", completed: true, xp: 20, impact: "fort", unlocks: "Accès au coaching personnalisé" },
      { id: "t1-2", title: "Appliquer le module mindset", priority: "normal", completed: true, xp: 15, impact: "moyen" },
      { id: "t1-3", title: "Créer sa structure juridique", priority: "important", completed: false, xp: 25, impact: "fort", unlocks: "Permet la facturation légale", recommended: true },
      { id: "t1-4", title: "Identifier 10 niches à fort potentiel", priority: "normal", completed: false, xp: 30, impact: "fort", unlocks: "Prépare la validation niche" },
      { id: "t1-5", title: "Réserver l'appel de validation niche", priority: "validation", completed: false, xp: 20, impact: "fort", unlocks: "Débloque l'étape Boutique" },
      { id: "t1-6", title: "Sourcing produit + validation coach", priority: "blocking", completed: false, xp: 35, impact: "fort", unlocks: "Valide la viabilité produit" },
    ],
    validation: {
      id: "v1",
      title: "Validation de niche obligatoire",
      description: "Votre niche doit être validée par un coach avant de passer au lancement de votre boutique.",
      validated: false,
      blocksNext: true,
      requirement: "Soumettre votre shortlist finale de niches au coach",
      unlocksLabel: "Lancement boutique",
      missingAction: "Soumettre votre shortlist finale",
    },
    insights: [
      { type: "tip", title: "Conseil Jestly", content: "Choisissez une niche avec une demande prouvée. Vérifiez Google Trends et le volume de recherche avant de vous engager." },
      { type: "trap", title: "Piège fréquent", content: "Ne choisissez pas une niche uniquement parce qu'elle vous plaît. Validez la demande marché en priorité." },
      { type: "signal", title: "Signaux d'une bonne niche", content: "Volume de recherche > 10K/mois, concurrence modérée, marge possible > 30%, saisonnalité faible." },
    ],
    notes: "",
    score: { label: "Confiance niche", value: 2, max: 6 },
    checklists: [
      {
        label: "Signaux d'une bonne niche",
        items: [
          { text: "Volume de recherche suffisant", checked: true },
          { text: "Concurrence analysée", checked: false },
          { text: "Marge bénéficiaire viable", checked: false },
          { text: "Fournisseur identifié", checked: false },
          { text: "Pas de saisonnalité forte", checked: true },
          { text: "Potentiel de branding", checked: false },
        ],
      },
    ],
    unlock: {
      unlocks: "Lancement boutique",
      condition: "Niche validée par le coach",
      riskIfIgnored: "Lancer une boutique sur un marché non viable = perte de temps et d'argent",
    },
  },
  // ────────────────────────── ÉTAPE 2 ──────────────────────────
  {
    id: "s2",
    number: 2,
    title: "Lancement boutique",
    subtitle: "Création, branding & optimisation de votre boutique",
    objective: "Créer une boutique professionnelle prête à convertir",
    iconName: "Store",
    status: "available",
    estimatedDuration: "2-3 semaines",
    difficulty: "débutant",
    modules: [
      { id: "m2-1", title: "Avant de commencer votre boutique", duration: "15 min", completed: false, importance: "fondation", benefit: "Éviter les erreurs de structure dès le départ", xp: 10 },
      { id: "m2-2", title: "Lancement Shopify pas à pas", duration: "60 min", completed: false, importance: "fondation", benefit: "Maîtriser l'outil de A à Z", xp: 25 },
      { id: "m2-3", title: "Optimisation Shopify avancée", duration: "40 min", completed: false, importance: "recommandé", benefit: "Maximiser la vitesse et la conversion", xp: 20 },
      { id: "m2-4", title: "Créer une offre qui convertit", duration: "35 min", completed: false, importance: "fondation", benefit: "Transformer les visiteurs en acheteurs", xp: 20 },
    ],
    tasks: [
      { id: "t2-1", title: "Lancer la création de votre boutique", priority: "important", completed: false, xp: 25, impact: "fort", unlocks: "Base de votre présence en ligne" },
      { id: "t2-2", title: "Envoyer niche et produit finalisés", priority: "normal", completed: false, xp: 15, impact: "moyen" },
      { id: "t2-3", title: "Dupliquer et développer les pages produits", priority: "normal", completed: false, xp: 30, impact: "fort", unlocks: "Catalogue complet" },
      { id: "t2-4", title: "Développer le branding complet", priority: "important", completed: false, xp: 25, impact: "fort", unlocks: "Identité de marque crédible" },
      { id: "t2-5", title: "Vérifier conformité Google / anti-ban", priority: "blocking", completed: false, xp: 20, impact: "fort", unlocks: "Autorise le lancement Ads sans risque de ban" },
      { id: "t2-6", title: "Envoyer le site finalisé au coach", priority: "normal", completed: false, xp: 15, impact: "moyen" },
      { id: "t2-7", title: "Appliquer les modifications du coach", priority: "normal", completed: false, xp: 20, impact: "moyen" },
      { id: "t2-8", title: "Réserver l'appel de validation boutique", priority: "validation", completed: false, xp: 20, impact: "fort", unlocks: "Débloque Google Ads" },
    ],
    validation: {
      id: "v2",
      title: "Validation boutique obligatoire",
      description: "Votre boutique doit être inspectée et validée avant de lancer vos premières campagnes publicitaires.",
      validated: false,
      blocksNext: true,
      requirement: "Boutique complète, conforme et validée par le coach",
      unlocksLabel: "Google Ads",
      missingAction: "Envoyer la boutique finalisée au coach",
    },
    insights: [
      { type: "tip", title: "Conseil Jestly", content: "Concentrez-vous sur 1 à 3 produits maximum pour commencer. Mieux vaut une page produit parfaite que dix pages moyennes." },
      { type: "warning", title: "Attention", content: "Vérifiez les conditions Google Ads AVANT de lancer. Un site non conforme = compte banni dès le départ." },
      { type: "trap", title: "Erreur de débutant", content: "Ne passez pas 3 semaines sur le logo. Le branding doit être propre mais l'exécution compte plus que la perfection visuelle." },
    ],
    notes: "",
    score: { label: "Préparation boutique", value: 0, max: 8 },
    checklists: [
      {
        label: "Checklist conversion",
        items: [
          { text: "Photos produit haute qualité", checked: false },
          { text: "Description bénéfice-centrée", checked: false },
          { text: "Prix psychologique optimisé", checked: false },
          { text: "Avis clients (ou preuve sociale)", checked: false },
        ],
      },
      {
        label: "Checklist conformité Ads",
        items: [
          { text: "Mentions légales complètes", checked: false },
          { text: "Politique de retour claire", checked: false },
          { text: "Page Contact fonctionnelle", checked: false },
          { text: "CGV et politique de confidentialité", checked: false },
        ],
      },
    ],
    unlock: {
      unlocks: "Google Ads",
      condition: "Boutique validée par le coach",
      riskIfIgnored: "Lancer des Ads sur un site non optimisé = budget gaspillé et compte potentiellement banni",
    },
  },
  // ────────────────────────── ÉTAPE 3 ──────────────────────────
  {
    id: "s3",
    number: 3,
    title: "Google Ads",
    subtitle: "Configuration, lancement & optimisation initiale",
    objective: "Générer vos premières ventes via la publicité payante",
    iconName: "Target",
    status: "locked",
    estimatedDuration: "2-4 semaines",
    difficulty: "intermédiaire",
    modules: [
      { id: "m3-1", title: "Mise en place Google Ads & GMC", duration: "50 min", completed: false, importance: "fondation", benefit: "Maîtriser les outils publicitaires essentiels", xp: 25 },
      { id: "m3-2", title: "Stratégie Shopping débutant", duration: "40 min", completed: false, importance: "fondation", benefit: "Lancer des campagnes rentables dès le départ", xp: 20 },
    ],
    tasks: [
      { id: "t3-1", title: "Créer le compte Google Ads", priority: "important", completed: false, xp: 20, impact: "fort", unlocks: "Accès à la plateforme publicitaire" },
      { id: "t3-2", title: "Configurer le Google Merchant Center", priority: "important", completed: false, xp: 25, impact: "fort", unlocks: "Flux produits pour Shopping" },
      { id: "t3-3", title: "Installer le suivi de conversions", priority: "blocking", completed: false, xp: 30, impact: "fort", unlocks: "Données fiables pour optimiser" },
      { id: "t3-4", title: "Importer les produits dans le GMC", priority: "normal", completed: false, xp: 20, impact: "moyen" },
      { id: "t3-5", title: "Lancer les premières campagnes", priority: "important", completed: false, xp: 35, impact: "fort", unlocks: "Premières ventes potentielles" },
      { id: "t3-6", title: "Optimiser les campagnes initiales", priority: "normal", completed: false, xp: 30, impact: "fort" },
    ],
    validation: {
      id: "v3",
      title: "Validation optimisation Ads",
      description: "Vos campagnes doivent être optimisées et validées avant de passer au scaling.",
      validated: false,
      blocksNext: true,
      requirement: "Campagnes actives avec ROAS positif pendant 7 jours",
      unlocksLabel: "Optimisation & Scaling",
      missingAction: "Atteindre un ROAS positif sur 7 jours consécutifs",
    },
    insights: [
      { type: "warning", title: "Alerte critique", content: "Ne lancez JAMAIS de campagne sans suivi de conversions actif. Vous brûleriez votre budget sans données exploitables." },
      { type: "tip", title: "Conseil Jestly", content: "Commencez avec un budget de 20-30 €/jour. Laissez tourner 7 jours avant de tirer des conclusions." },
      { type: "signal", title: "Prêt pour les Ads ?", content: "Boutique validée, tracking installé, flux GMC approuvé, budget défini. Si un élément manque, ne lancez pas." },
    ],
    notes: "",
    score: { label: "Readiness publicitaire", value: 0, max: 6 },
    checklists: [
      {
        label: "Checklist tracking",
        items: [
          { text: "Google Tag installé", checked: false },
          { text: "Conversion achat configurée", checked: false },
          { text: "Conversion ajout panier", checked: false },
          { text: "Test de conversion validé", checked: false },
        ],
      },
      {
        label: "Checklist GMC",
        items: [
          { text: "Flux produits importé", checked: false },
          { text: "Produits approuvés", checked: false },
          { text: "Domaine vérifié", checked: false },
        ],
      },
    ],
    unlock: {
      unlocks: "Optimisation & Scaling",
      condition: "Campagnes validées avec ROAS positif",
      riskIfIgnored: "Scaler sans optimisation = multiplication des pertes",
    },
  },
  // ────────────────────────── ÉTAPE 4 ──────────────────────────
  {
    id: "s4",
    number: 4,
    title: "Optimisation & Scaling",
    subtitle: "Stratégie avancée, SEO & diversification",
    objective: "Diversifier vos canaux et stabiliser la croissance",
    iconName: "TrendingUp",
    status: "locked",
    estimatedDuration: "4-8 semaines",
    difficulty: "intermédiaire",
    modules: [
      { id: "m4-1", title: "Stratégie Shopping avancée", duration: "45 min", completed: false, importance: "recommandé", benefit: "Doubler votre ROAS sur Shopping", xp: 20 },
      { id: "m4-2", title: "Stratégie Search Google Ads", duration: "35 min", completed: false, importance: "recommandé", benefit: "Capter la demande intentionniste", xp: 20 },
      { id: "m4-3", title: "Passer de 10K à 50K/mois", duration: "50 min", completed: false, importance: "avancé", benefit: "Framework de scaling éprouvé", xp: 25 },
      { id: "m4-4", title: "SEO e-commerce", duration: "40 min", completed: false, importance: "recommandé", benefit: "Trafic gratuit et durable", xp: 20 },
      { id: "m4-5", title: "Stratégie emailing", duration: "30 min", completed: false, importance: "recommandé", benefit: "Revenus récurrents sans pub", xp: 15 },
    ],
    tasks: [
      { id: "t4-1", title: "Optimiser et scaler les campagnes Google", priority: "important", completed: false, xp: 40, impact: "fort", unlocks: "Croissance publicitaire maîtrisée" },
      { id: "t4-2", title: "Mettre en place le SEO on-page", priority: "normal", completed: false, xp: 30, impact: "fort", unlocks: "Trafic organique à long terme" },
      { id: "t4-3", title: "Lancer la stratégie emailing", priority: "normal", completed: false, xp: 25, impact: "fort", unlocks: "Canal de revenus autonome" },
    ],
    validation: null,
    insights: [
      { type: "tip", title: "Levier recommandé", content: "Le SEO prend du temps mais génère du trafic gratuit. Lancez-le dès cette étape pour récolter les fruits en étape 5." },
      { type: "signal", title: "Diversification", content: "Ne restez pas dépendant d'un seul canal. Google Ads + SEO + Email = triangle de stabilité." },
    ],
    notes: "",
    score: { label: "Diversification acquisition", value: 0, max: 3 },
    checklists: [
      {
        label: "Canaux d'acquisition",
        items: [
          { text: "Google Shopping optimisé", checked: false },
          { text: "Google Search activé", checked: false },
          { text: "SEO en place", checked: false },
          { text: "Email marketing configuré", checked: false },
        ],
      },
    ],
    unlock: {
      unlocks: "Scaling MAX",
      condition: "Au moins 2 canaux d'acquisition actifs",
      riskIfIgnored: "Dépendance à un seul canal = vulnérabilité maximale",
    },
  },
  // ────────────────────────── ÉTAPE 5 ──────────────────────────
  {
    id: "s5",
    number: 5,
    title: "Scaling MAX",
    subtitle: "Multi-canal, CRO, délégation & industrialisation",
    objective: "Industrialiser votre business pour une croissance durable",
    iconName: "Rocket",
    status: "locked",
    estimatedDuration: "En continu",
    difficulty: "avancé",
    modules: [
      { id: "m5-1", title: "Meta Ads pour e-commerce", duration: "50 min", completed: false, importance: "avancé", benefit: "Nouveau canal publicitaire puissant", xp: 25 },
      { id: "m5-2", title: "CRO — Optimisation du taux de conversion", duration: "40 min", completed: false, importance: "recommandé", benefit: "Plus de revenus sans plus de trafic", xp: 20 },
      { id: "m5-3", title: "Scaling externe & partenariats", duration: "30 min", completed: false, importance: "avancé", benefit: "Multiplier les sources de croissance", xp: 20 },
      { id: "m5-4", title: "SAV & téléphonie e-commerce", duration: "25 min", completed: false, importance: "recommandé", benefit: "Fidéliser et réduire les litiges", xp: 15 },
    ],
    tasks: [
      { id: "t5-1", title: "Tester de nouveaux produits sur la niche", priority: "normal", completed: false, xp: 30, impact: "fort", unlocks: "Diversification du catalogue" },
      { id: "t5-2", title: "Continuer l'optimisation Google Ads", priority: "important", completed: false, xp: 25, impact: "fort" },
      { id: "t5-3", title: "Optimiser le CRM et la boutique", priority: "normal", completed: false, xp: 20, impact: "moyen" },
      { id: "t5-4", title: "Lancer les campagnes Meta Ads", priority: "important", completed: false, xp: 35, impact: "fort", unlocks: "Canal Meta ouvert" },
      { id: "t5-5", title: "Optimiser les pages produits (CRO)", priority: "normal", completed: false, xp: 30, impact: "fort", unlocks: "Meilleur taux de conversion" },
      { id: "t5-6", title: "Mettre en place la téléphonie e-com", priority: "normal", completed: false, xp: 20, impact: "moyen" },
      { id: "t5-7", title: "Déléguer le SAV", priority: "important", completed: false, xp: 25, impact: "fort", unlocks: "Libère votre temps pour le scaling" },
    ],
    validation: null,
    insights: [
      { type: "tip", title: "Félicitations", content: "Vous êtes dans la phase d'industrialisation. Chaque optimisation ici démultiplie vos résultats." },
      { type: "signal", title: "Prêt pour le scaling ?", content: "ROAS stable > 3, processus SAV en place, au moins 2 canaux actifs, marge nette > 20%." },
    ],
    notes: "",
    score: { label: "Industrialisation", value: 0, max: 7 },
    checklists: [
      {
        label: "Checklist délégation",
        items: [
          { text: "Process SAV documenté", checked: false },
          { text: "Opérateur SAV formé", checked: false },
          { text: "Téléphonie configurée", checked: false },
          { text: "Dashboard monitoring en place", checked: false },
        ],
      },
      {
        label: "Robustesse business",
        items: [
          { text: "ROAS stable > 3", checked: false },
          { text: "Marge nette > 20%", checked: false },
          { text: "2+ canaux d'acquisition", checked: false },
          { text: "Processus reproductible", checked: false },
        ],
      },
    ],
    unlock: {
      unlocks: "Business autonome",
      condition: "Tous les processus délégués et automatisés",
      riskIfIgnored: "Rester opérateur au lieu de devenir entrepreneur",
    },
  },
];
