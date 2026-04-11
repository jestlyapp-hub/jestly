import type { GuideChapter } from "./guide.types";

// ═══════════════════════════════════════════════════════════════════
// ONBOARDING V3 — Flow officiel Jestly
//
// ORDRE : BUSINESS FIRST, SITE ENSUITE
//
// PHASE 0 : Clients (créer premier client)
// PHASE 1 : Commandes (créer première commande)
// PHASE 2 : Dashboard WOW (voir les stats prendre vie)
// PHASE 3 : Création du site (si aucun site n'existe)
// PHASE 4 : Site / Éditeur / Blocs (comprendre la structure)
// PHASE 5 : Brief (créer + expliquer)
// PHASE 6 : Produit (créer + associer brief)
// PHASE 7 : Bloc de vente (ajouter + lier produit)
// PHASE 8 : Publier
//
// RÈGLES :
// - Les 3 premières phases n'ont AUCUN prérequis
// - Le site n'est PAS obligatoire pour commencer
// - L'utilisateur voit de la valeur en < 60 secondes
// ═══════════════════════════════════════════════════════════════════

export const CHAPTERS: GuideChapter[] = [

  // ═══ 0. CLIENTS — Premier contact avec Jestly ══════════════════
  {
    id: "clients",
    title: "Ajouter votre premier client",
    description: "La base de tout : votre CRM",
    icon: "👤",
    color: "#4F46E5",
    skipIf: (a) => a.hasClients,
    skipMessage: "Vous avez déjà des clients",
    steps: [
      {
        id: "clients_welcome", chapterId: "clients", kind: "intro",
        title: "Bienvenue sur Jestly !",
        body: "On va configurer votre espace en quelques étapes.\n\nD'abord, ajoutons votre premier client. C'est la base de tout le reste : commandes, factures, analytics.",
        why: "Voici le parcours :\n1. Ajouter un client\n2. Créer une commande\n3. Voir votre dashboard prendre vie\n4. Créer votre site vitrine",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Ajouter un client",
        placement: "center",
      },
      {
        id: "clients_click_new", chapterId: "clients", kind: "action",
        title: "Cliquez « + Nouveau client »",
        body: "Le formulaire de création va s'ouvrir.",
        preActions: [
          { type: "navigate", route: "/clients" },
          { type: "waitFor", selector: '[data-guide="new-client-btn"]', timeout: 8000 },
        ],
        requiredRoute: "/clients",
        target: { selector: '[data-guide="new-client-btn"]', placement: "bottom" },
        completeWhen: { type: "click", selector: '[data-guide="new-client-btn"]' },
      },
      {
        id: "clients_fill", chapterId: "clients", kind: "action",
        title: "Créez votre premier client",
        body: "Entrez un nom et un email, puis cliquez « Créer le client ».\n\nConseil : utilisez un vrai client pour voir la vraie valeur de Jestly.",
        requiredRoute: "/clients",
        nonBlocking: true,
        completeWhen: { type: "custom", key: "qs_client_created", pollMs: 1000, timeoutMs: 120000 },
      },
      {
        id: "clients_done", chapterId: "clients", kind: "recap", tone: "success",
        title: "Premier client ajouté !",
        body: "Votre base client est lancée.\nPassons à la commande.",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Créer une commande",
        placement: "center",
      },
    ],
  },

  // ═══ 1. COMMANDES — Première commande ══════════════════════════
  {
    id: "orders",
    title: "Créer votre première commande",
    description: "Titre, prix et deadline",
    icon: "📋",
    color: "#10B981",
    skipIf: (a) => a.hasOrders,
    skipMessage: "Vous avez déjà des commandes",
    steps: [
      {
        id: "orders_intro", chapterId: "orders", kind: "explain",
        title: "La commande : le cœur de votre activité",
        body: "Une commande = un projet avec un titre, un prix et une deadline.\n\nChaque commande alimente votre dashboard, votre calendrier et vos analytics.",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Créer la commande",
        placement: "center",
      },
      {
        id: "orders_click_new", chapterId: "orders", kind: "action",
        title: "Cliquez « + Nouvelle commande »",
        body: "Le formulaire de création va s'ouvrir.",
        preActions: [
          { type: "navigate", route: "/commandes" },
          { type: "waitFor", selector: '[data-guide="new-order-btn"]', timeout: 8000 },
        ],
        requiredRoute: "/commandes",
        target: { selector: '[data-guide="new-order-btn"]', placement: "bottom" },
        completeWhen: { type: "click", selector: '[data-guide="new-order-btn"]' },
      },
      {
        id: "orders_fill", chapterId: "orders", kind: "action",
        title: "Remplissez et créez la commande",
        body: "Donnez un titre, un prix, associez le client que vous venez de créer, et surtout une **deadline**.\n\nPuis cliquez « Créer la commande ».",
        requiredRoute: "/commandes",
        nonBlocking: true,
        completeWhen: { type: "custom", key: "qs_order_created", pollMs: 1000, timeoutMs: 120000 },
      },
      {
        id: "orders_done", chapterId: "orders", kind: "recap", tone: "success",
        title: "Première commande créée !",
        body: "Votre commande est enregistrée avec sa deadline.\nVoyons votre dashboard prendre vie.",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Voir le dashboard",
        placement: "center",
      },
    ],
  },

  // ═══ 2. DASHBOARD WOW — Le moment magique ═════════════════════
  {
    id: "dashboard_wow",
    title: "Votre dashboard prend vie",
    description: "Stats et vue d'ensemble",
    icon: "✨",
    color: "#8B5CF6",
    steps: [
      {
        id: "wow_dashboard", chapterId: "dashboard_wow", kind: "show",
        title: "Votre dashboard est vivant !",
        body: "Regardez : votre chiffre d'affaires, votre commande active, votre client...\n\nTout est déjà connecté. Avec une seule commande, Jestly affiche déjà des stats utiles.",
        why: "C'est votre cockpit. Revenue, commandes, clients, deadlines — tout ici.",
        preActions: [
          { type: "navigate", route: "/dashboard" },
          { type: "delay", ms: 500 },
        ],
        requiredRoute: "/dashboard",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Voir le calendrier",
        placement: "center",
      },
      {
        id: "wow_calendar", chapterId: "dashboard_wow", kind: "show",
        title: "Votre deadline est au calendrier",
        body: "La commande que vous venez de créer apparaît automatiquement dans le calendrier.\n\nChaque commande avec deadline se retrouve ici. Plus besoin de Google Agenda.",
        preActions: [
          { type: "navigate", route: "/calendrier" },
          { type: "delay", ms: 800 },
        ],
        requiredRoute: "/calendrier",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Créer mon site",
        placement: "center",
      },
      {
        id: "wow_recap", chapterId: "dashboard_wow", kind: "recap", tone: "success",
        title: "Votre business est lancé !",
        body: "✅ Client enregistré\n📋 Commande avec deadline\n📅 Calendrier rempli\n📊 Dashboard actif\n\nMaintenant, créons votre site pour que vos clients puissent commander en ligne.",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Créer mon site",
        placement: "center",
      },
    ],
  },

  // ═══ 3. CRÉATION DU SITE ═══════════════════════════════════════
  // Skippé si accountState.hasSite === true.
  {
    id: "create_site",
    title: "Créer votre site",
    description: "Votre vitrine en ligne",
    icon: "🌐",
    color: "#4F46E5",
    skipIf: (a) => a.hasSite,
    skipMessage: "Vous avez déjà un site",
    steps: [
      {
        id: "create_site_intro", chapterId: "create_site", kind: "intro",
        title: "Créons votre site vitrine",
        body: "Votre business est en place. Maintenant, créons votre site pour que vos clients puissent commander en ligne.\n\nVotre site accueillera vos offres, vos formulaires et vos pages.",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Créer mon site",
        placement: "center",
      },
      {
        id: "create_site_choose", chapterId: "create_site", kind: "action",
        title: "Choisissez votre point de départ",
        body: "Cliquez sur le template qui vous plaît.\nTout sera modifiable ensuite.",
        preActions: [
          { type: "navigate", route: "/site-web/nouveau" },
          { type: "delay", ms: 500 },
        ],
        requiredRoute: "/site-web/nouveau",
        placement: "center",
        nonBlocking: true,
        completeWhen: { type: "custom", key: "site_exists", pollMs: 1000, timeoutMs: 120000 },
      },
      {
        id: "create_site_done", chapterId: "create_site", kind: "recap", tone: "success",
        title: "Site créé !",
        body: "Votre site est prêt. Vous êtes maintenant dans l'éditeur.\nDécouvrons comment il fonctionne.",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Découvrir l'éditeur",
        placement: "center",
      },
    ],
  },

  // ═══ 4. SITE / ÉDITEUR / AJOUT PREMIER BLOC ═══════════════════
  {
    id: "site",
    title: "Ajoutez votre premier bloc",
    description: "Découvrez l'éditeur en ajoutant un bloc",
    icon: "🧱",
    color: "#4F46E5",
    steps: [
      {
        id: "welcome", chapterId: "site", kind: "intro",
        title: "Découvrez l'éditeur",
        body: "Votre site se construit bloc par bloc : texte, images, offres, témoignages, formulaires…\n\nAjoutons votre premier bloc pour comprendre le fonctionnement.",
        completeWhen: { type: "acknowledge" }, ctaLabel: "C'est parti",
        placement: "center",
      },
      {
        id: "site_add_block_cta", chapterId: "site", kind: "action",
        title: "Ajoutez un nouveau bloc",
        body: "Cliquez sur « + Ajouter un bloc » pour ouvrir la bibliothèque de sections disponibles.",
        preActions: [
          { type: "navigate", route: "/createur" },
          { type: "waitFor", selector: '[data-guide="add-block-btn"]', timeout: 10000 },
        ],
        requiredRoute: "/createur",
        target: { selector: '[data-guide="add-block-btn"]', placement: "top" },
        completeWhen: { type: "click", selector: '[data-guide="add-block-btn"]' },
      },
      {
        id: "site_pick_block", chapterId: "site", kind: "action",
        title: "Choisissez un bloc",
        body: "Sélectionnez un bloc dans le catalogue pour l'ajouter à votre page.\nVous pouvez choisir n'importe lequel : texte, hero, contact, CTA…",
        requiredRoute: "/createur",
        target: { selector: '[data-guide="block-catalog"]', placement: "left" },
        preActions: [
          { type: "waitFor", selector: '[data-guide="block-catalog"]', timeout: 8000 },
        ],
        completeWhen: { type: "custom", key: "block_selected_in_builder", pollMs: 500, timeoutMs: 90000 },
      },
      {
        id: "site_block_added", chapterId: "site", kind: "show",
        title: "Bloc ajouté — modifiez-le",
        body: "Votre bloc est maintenant dans votre page.\nDans le panneau à droite, vous pouvez modifier son contenu, son style et ses réglages.\n\nChaque bloc fonctionne ainsi : ajout → sélection → modification.",
        requiredRoute: "/createur",
        target: { selector: '[data-guide="block-property-panel"]', placement: "left" },
        preActions: [
          { type: "waitFor", selector: '[data-guide="block-property-panel"]', timeout: 5000 },
        ],
        completeWhen: { type: "acknowledge" }, ctaLabel: "Passons au brief",
      },
    ],
  },

  // ═══ 5. BRIEF ══════════════════════════════════════════════════
  {
    id: "brief",
    title: "Créer un brief",
    description: "Le questionnaire envoyé au client",
    icon: "📋",
    color: "#F59E0B",
    steps: [
      {
        id: "brief_intro", chapterId: "brief", kind: "explain",
        title: "Le brief : récolter les infos client",
        body: "Un brief est un questionnaire envoyé automatiquement au client quand il commande.\n\nIl structure le besoin :\n• Quel projet ?\n• Quel style ?\n• Quelle deadline ?\n• Quels fichiers ?\n\nRésultat : vous recevez une commande complète, sans relance par email.",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Créer un brief",
        placement: "center", educational: true,
      },
      {
        id: "brief_nav", chapterId: "brief", kind: "show",
        title: "La section Briefs",
        body: "Vos templates de briefs sont ici, en bas de la page Offres.\nChaque brief est réutilisable sur plusieurs produits.",
        preActions: [
          { type: "navigate", route: "/offres" },
          { type: "waitFor", selector: '[data-guide="briefs-section"]', timeout: 10000 },
          { type: "scrollTo", selector: '[data-guide="briefs-section"]' },
        ],
        requiredRoute: "/offres",
        target: { selector: '[data-guide="briefs-section"]', placement: "top" },
        completeWhen: { type: "acknowledge" }, ctaLabel: "Compris",
      },
      {
        id: "brief_click", chapterId: "brief", kind: "action",
        title: "Cliquez « Créer un brief »",
        body: "Le formulaire de création va s'ouvrir.",
        requiredRoute: "/offres",
        target: { selector: '[data-guide="new-brief-btn"]', placement: "bottom" },
        preActions: [{ type: "waitFor", selector: '[data-guide="new-brief-btn"]' }],
        completeWhen: { type: "click", selector: '[data-guide="new-brief-btn"]' },
      },
      {
        id: "brief_fill_and_submit", chapterId: "brief", kind: "action",
        title: "Nommez et créez votre brief",
        body: "Donnez un nom (ex : Brief Miniature YouTube), puis cliquez « Créer avec le template par défaut ».\n\nLe template inclut les champs essentiels : date souhaitée, description du besoin, fichiers à fournir.\nTout est personnalisable ensuite.",
        requiredRoute: "/offres",
        target: { selector: '[data-guide="brief-name-input"]', placement: "right" },
        preActions: [{ type: "waitFor", selector: '[data-guide="brief-name-input"]', timeout: 6000 }],
        completeWhen: { type: "click", selector: '[data-guide="brief-create-default"]' },
      },
      {
        id: "brief_done", chapterId: "brief", kind: "recap", tone: "success",
        title: "Brief créé !",
        body: "Votre brief est prêt. Passons à la création de votre produit.",
        requiredRoute: "/offres",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Créer le produit",
        placement: "center",
      },
    ],
  },

  // ═══ 6. PRODUIT + ASSOCIATION BRIEF ════════════════════════════
  {
    id: "product",
    title: "Créer un produit",
    description: "Votre offre + le brief associé",
    icon: "📦",
    color: "#10B981",
    steps: [
      {
        id: "product_intro", chapterId: "product", kind: "explain",
        title: "Le produit : ce que le client achète",
        body: "Un produit = votre prestation.\n\n• Service (ex : Logo, Miniature YouTube)\n• Pack (ex : Identité visuelle complète)\n• Digital (ex : Template, eBook)\n\nLe produit vend votre prestation.\nLe brief récupère les informations pour la réaliser.",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Créer le produit",
        placement: "center", educational: true,
      },
      {
        id: "product_click_new", chapterId: "product", kind: "action",
        title: "Cliquez « Nouvelle offre »",
        body: "Ce bouton ouvre le formulaire de création.",
        requiredRoute: "/offres",
        target: { selector: '[data-guide="new-product-btn"]', placement: "bottom" },
        preActions: [
          { type: "scrollTo", selector: '[data-guide="new-product-btn"]' },
          { type: "waitFor", selector: '[data-guide="new-product-btn"]' },
        ],
        completeWhen: { type: "click", selector: '[data-guide="new-product-btn"]' },
      },
      {
        id: "product_fill_and_submit", chapterId: "product", kind: "action",
        title: "Remplissez et créez votre offre",
        body: "Donnez un nom (ex : Miniature YouTube Premium), un prix, puis cliquez « Créer ».\n\nTout sera modifiable ensuite.",
        requiredRoute: "/offres",
        target: { selector: '[data-guide="product-name-input"]', placement: "right" },
        preActions: [{ type: "waitFor", selector: '[data-guide="product-name-input"]', timeout: 6000 }],
        completeWhen: { type: "click", selector: '[data-guide="product-create-submit"]' },
      },
      {
        id: "product_created", chapterId: "product", kind: "explain",
        title: "Produit créé ! Associons le brief.",
        body: "Ouvrons votre produit pour y associer le brief.\nLe client recevra automatiquement le questionnaire à chaque commande.",
        requiredRoute: "/offres",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Ouvrir le produit",
        placement: "center",
      },
      {
        id: "product_click_edit", chapterId: "product", kind: "action",
        title: "Cliquez « Éditer »",
        body: "Ce bouton ouvre la page de configuration du produit.",
        requiredRoute: "/offres",
        target: { selector: '[data-guide="product-edit-btn"]', placement: "bottom" },
        preActions: [
          { type: "scrollTo", selector: '[data-guide="product-edit-btn"]' },
          { type: "waitFor", selector: '[data-guide="product-edit-btn"]', timeout: 6000 },
        ],
        completeWhen: { type: "click", selector: '[data-guide="product-edit-btn"]' },
      },
      {
        id: "product_tab_brief", chapterId: "product", kind: "action",
        title: "Ouvrez l'onglet « Brief »",
        body: "C'est ici que vous associez le brief à votre produit.",
        requiredRoute: "/offres",
        target: { selector: '[data-guide="product-tab-brief"]', placement: "bottom" },
        preActions: [{ type: "waitFor", selector: '[data-guide="product-tab-brief"]', timeout: 8000 }],
        completeWhen: { type: "custom", key: "brief_tab_or_linked", pollMs: 500, timeoutMs: 60000 },
      },
      {
        id: "product_select_brief", chapterId: "product", kind: "show",
        title: "Sélectionnez votre brief",
        body: "Choisissez le brief créé précédemment dans la liste.\nLe client le recevra après chaque commande.",
        requiredRoute: "/offres",
        target: { selector: '[data-guide="product-add-brief-select"]', placement: "right" },
        preActions: [
          { type: "waitFor", selector: '[data-guide="product-add-brief-select"]', timeout: 6000 },
          { type: "scrollTo", selector: '[data-guide="product-add-brief-select"]' },
        ],
        completeWhen: { type: "custom", key: "brief_linked_to_product", pollMs: 500, timeoutMs: 60000 },
      },
      {
        id: "product_save_brief", chapterId: "product", kind: "action",
        title: "Enregistrez l'association",
        body: "Cliquez « Enregistrer » pour lier le brief au produit.",
        target: { selector: '[data-guide="product-save-brief"]', placement: "top" },
        preActions: [
          { type: "waitFor", selector: '[data-guide="product-save-brief"]' },
          { type: "scrollTo", selector: '[data-guide="product-save-brief"]' },
        ],
        completeWhen: { type: "custom", key: "brief_linked_to_product", pollMs: 500, timeoutMs: 60000 },
      },
      {
        id: "product_done", chapterId: "product", kind: "recap", tone: "success",
        title: "Produit + Brief liés !",
        body: "Votre offre est prête avec son brief associé.\nAjoutons-la sur votre site.",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Afficher sur le site",
        placement: "center",
      },
    ],
  },

  // ═══ 7. AJOUTER BLOC DE VENTE ═════════════════════════════════
  {
    id: "builder",
    title: "Ajouter un bloc de vente",
    description: "Ajoutez un bloc produit puis sélectionnez votre offre",
    icon: "🧱",
    color: "#0EA5E9",
    steps: [
      {
        id: "builder_intro", chapterId: "builder", kind: "explain",
        title: "Ajouter un bloc de vente produit",
        body: "Votre produit est créé, mais il n'est pas encore visible sur votre site.\n\nProduit = la donnée commerciale (nom, prix, description).\nBloc de vente = l'affichage sur la page.\n\nOn va ajouter un bloc de vente à votre site, puis y sélectionner le produit que vous venez de créer.",
        why: "Sans bloc de vente, votre produit existe dans Jestly mais n'apparaît pas sur votre site public. C'est le bloc qui fait le lien entre les deux.",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Ajouter le bloc",
        placement: "center", educational: true,
      },
      {
        id: "builder_open_library", chapterId: "builder", kind: "action",
        title: "Ouvrez la bibliothèque de blocs",
        body: "Cliquez sur « + Ajouter un bloc » pour ouvrir le catalogue de blocs disponibles.",
        preActions: [
          { type: "navigate", route: "/createur" },
          { type: "waitFor", selector: '[data-guide="add-block-btn"]', timeout: 10000 },
        ],
        requiredRoute: "/createur",
        target: { selector: '[data-guide="add-block-btn"]', placement: "top" },
        completeWhen: { type: "custom", key: "block_or_library_open", pollMs: 300, timeoutMs: 90000 },
      },
      {
        id: "builder_select_vente", chapterId: "builder", kind: "action",
        title: "Catégorie « Vente produit »",
        body: "Cette catégorie contient les blocs pour vendre vos services et produits.\nChoisissez-la pour voir les blocs de vente disponibles.",
        requiredRoute: "/createur",
        target: { selector: '[data-guide="block-cat-vente"]', placement: "right" },
        preActions: [
          { type: "waitFor", selector: '[data-guide="block-cat-vente"]', timeout: 8000 },
        ],
        completeWhen: { type: "custom", key: "block_or_vente_selected", pollMs: 300, timeoutMs: 60000 },
      },
      {
        id: "builder_pick_block", chapterId: "builder", kind: "action",
        title: "Choisissez « Grille Produits »",
        body: "Sélectionnez un bloc de vente comme :\n• Grille Produits\n• Service cards\n• Hero Produit\n\nCe bloc affichera votre offre sur la page.",
        requiredRoute: "/createur",
        target: { selector: '[data-guide="block-catalog"]', placement: "left" },
        preActions: [
          { type: "waitFor", selector: '[data-guide="block-catalog"]', timeout: 8000 },
        ],
        completeWhen: { type: "custom", key: "has_product_block", pollMs: 500, timeoutMs: 60000 },
      },
      {
        id: "builder_block_ready", chapterId: "builder", kind: "show",
        title: "Bloc ajouté — configurons-le",
        body: "Votre bloc de vente est maintenant dans votre page.\nDans le panneau à droite, vous allez choisir quels produits ce bloc doit afficher.\n\nC'est ici que le lien se fait entre votre produit et votre site.",
        requiredRoute: "/createur",
        target: { selector: '[data-guide="block-property-panel"]', placement: "left" },
        preActions: [
          { type: "delay", ms: 400 },
          { type: "waitFor", selector: '[data-guide="block-property-panel"]', timeout: 5000 },
        ],
        completeWhen: { type: "acknowledge" }, ctaLabel: "Ajouter le produit",
      },
      {
        id: "builder_select_product", chapterId: "builder", kind: "action",
        title: "Ajoutez votre produit au bloc",
        body: "Dans la liste à droite, cliquez sur le produit que vous avez créé.\nUne fois sélectionné, il apparaîtra automatiquement sur votre site.",
        why: "S'il n'apparaît pas, utilisez le champ de recherche juste au-dessus.",
        requiredRoute: "/createur",
        target: { selector: '[data-guide="products-search"]', placement: "left" },
        preActions: [
          { type: "waitFor", selector: '[data-guide="products-search"]', timeout: 15000 },
        ],
        nonBlocking: true,
        completeWhen: { type: "custom", key: "product_displayed", pollMs: 1000, timeoutMs: 120000 },
      },
      {
        id: "builder_product_visible", chapterId: "builder", kind: "recap", tone: "success",
        title: "Produit ajouté avec succès !",
        body: "Votre offre est maintenant visible sur votre site.\nLes visiteurs pourront la voir et la commander directement.\n\nPublions le site pour le rendre accessible au monde entier.",
        requiredRoute: "/createur",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Publier le site",
        placement: "center",
      },
    ],
  },

  // ═══ 8. PUBLIER LE SITE ════════════════════════════════════════
  {
    id: "publish",
    title: "Publier votre site",
    description: "Votre site est prêt, publions-le",
    icon: "🚀",
    color: "#8B5CF6",
    steps: [
      {
        id: "pub_intro", chapterId: "publish", kind: "explain",
        title: "Publier votre site",
        body: "Votre site est prêt avec votre offre.\nPublions-le pour qu'il soit accessible à vos clients.",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Publier maintenant",
        placement: "center",
      },
      {
        id: "pub_click", chapterId: "publish", kind: "action",
        title: "Cliquez ici pour publier",
        body: "Cliquez sur « Publier » pour mettre votre site en ligne.\nVotre produit sera commandable avec le brief associé.",
        requiredRoute: "/createur",
        target: { selector: '[data-guide="publish-site"]', placement: "bottom" },
        preActions: [
          { type: "navigate", route: "/createur" },
          { type: "waitFor", selector: '[data-guide="publish-site"]', timeout: 10000 },
        ],
        completeWhen: { type: "custom", key: "site_published", pollMs: 500, timeoutMs: 30000 },
      },
      {
        id: "pub_done", chapterId: "publish", kind: "recap", tone: "success",
        title: "Votre système est complet !",
        body: "✅ Client enregistré\n📋 Commande créée\n📊 Dashboard actif\n🌐 Site en ligne avec votre offre\n📋 Brief intégré\n\nTout est connecté. Bonne continuation sur Jestly !",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Commencer à utiliser Jestly",
        placement: "center",
      },
    ],
  },
];
